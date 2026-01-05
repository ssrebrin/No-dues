import { EventType } from "../components/event";

// Функция для расчета следующего вхождения регулярного события
export function getNextRegularEventDate(
  startDate: string,
  regularity: string,
  currentDate: Date = new Date()
): Date | null {
  if (!regularity || !regularity.includes(':')) return null;
  
  const [type, interval] = regularity.split(':');
  const intervalNum = parseInt(interval);
  
  if (isNaN(intervalNum) || intervalNum <= 0) return null;
  
  // Парсим стартовую дату
  const startDateTime = parseEventDateTime(startDate);
  if (!startDateTime) return null;
  
  // Если стартовая дата в будущем, возвращаем её
  if (startDateTime > currentDate) {
    return startDateTime;
  }
  
  // Рассчитываем следующее вхождение
  let nextDate = new Date(startDateTime);
  const diffMs = currentDate.getTime() - startDateTime.getTime();
  
  switch (type) {
    case 'minutes':
      const minutesToAdd = Math.ceil(diffMs / (1000 * 60 * intervalNum));
      nextDate = new Date(startDateTime.getTime() + (minutesToAdd * 1000 * 60 * intervalNum));
      break;
      
    case 'hours':
      const hoursToAdd = Math.ceil(diffMs / (1000 * 60 * 60 * intervalNum));
      nextDate = new Date(startDateTime.getTime() + (hoursToAdd * 1000 * 60 * 60 * intervalNum));
      break;
      
    case 'days':
      const daysToAdd = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * intervalNum));
      nextDate = new Date(startDateTime.getTime() + (daysToAdd * 1000 * 60 * 60 * 24 * intervalNum));
      break;
      
    case 'weeks':
      const weeksToAdd = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7 * intervalNum));
      nextDate = new Date(startDateTime.getTime() + (weeksToAdd * 1000 * 60 * 60 * 24 * 7 * intervalNum));
      break;
      
    case 'months':
      nextDate = new Date(startDateTime);
      const monthsToAdd = calculateMonthsDifference(startDateTime, currentDate, intervalNum);
      nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
      
      // Если дата все еще в прошлом, добавляем еще один интервал
      while (nextDate <= currentDate) {
        nextDate.setMonth(nextDate.getMonth() + intervalNum);
      }
      break;
      
    case 'years':
      nextDate = new Date(startDateTime);
      const yearsToAdd = Math.ceil((currentDate.getFullYear() - startDateTime.getFullYear()) / intervalNum);
      nextDate.setFullYear(nextDate.getFullYear() + yearsToAdd);
      
      // Если дата все еще в прошлом, добавляем еще один интервал
      while (nextDate <= currentDate) {
        nextDate.setFullYear(nextDate.getFullYear() + intervalNum);
      }
      break;
      
    default:
      return null;
  }
  
  return nextDate;
}

// Функция для проверки, выпадает ли регулярное событие на конкретную дату
export function isRegularEventOnDate(
  startDate: string,
  regularity: string,
  targetDate: Date
): boolean {
  if (!regularity || !regularity.includes(':')) return false;
  
  const [type, interval] = regularity.split(':');
  const intervalNum = parseInt(interval);
  
  if (isNaN(intervalNum) || intervalNum <= 0) return false;
  
  const startDateTime = parseEventDateTime(startDate);
  if (!startDateTime) return false;
  
  // Сбрасываем время для сравнения дат (кроме минут/часов)
  const targetDateOnly = new Date(targetDate);
  const startDateOnly = new Date(startDateTime);
  
  if (type === 'minutes' || type === 'hours') {
    // Для минут и часов сравниваем полное время
    const diffMs = targetDate.getTime() - startDateTime.getTime();
    const intervalMs = type === 'minutes' 
      ? 1000 * 60 * intervalNum 
      : 1000 * 60 * 60 * intervalNum;
    
    return diffMs >= 0 && diffMs % intervalMs === 0;
  } else {
    // Для дней, недель, месяцев, лет сравниваем только даты
    targetDateOnly.setHours(0, 0, 0, 0);
    startDateOnly.setHours(0, 0, 0, 0);
    
    const diffMs = targetDateOnly.getTime() - startDateOnly.getTime();
    if (diffMs < 0) return false;
    
    switch (type) {
      case 'days':
        const daysDiff = diffMs / (1000 * 60 * 60 * 24);
        return daysDiff % intervalNum === 0;
        
      case 'weeks':
        const weeksDiff = diffMs / (1000 * 60 * 60 * 24 * 7);
        return weeksDiff % intervalNum === 0;
        
      case 'months':
        const monthsDiff = calculateMonthsDifference(startDateOnly, targetDateOnly, 1);
        return monthsDiff % intervalNum === 0;
        
      case 'years':
        const yearsDiff = targetDateOnly.getFullYear() - startDateOnly.getFullYear();
        return yearsDiff % intervalNum === 0;
        
      default:
        return false;
    }
  }
}

// Функция для получения всех вхождений регулярного события в определенный день
export function getRegularEventsOnDate(
  event: EventType,
  targetDate: Date
): Date[] {
  if (!event.Attributes.Regularity) return [];
  
  const occurrences: Date[] = [];
  const [type, interval] = event.Attributes.Regularity.split(':');
  const intervalNum = parseInt(interval);
  
  if (isNaN(intervalNum) || intervalNum <= 0) return occurrences;
  
  const startDateTime = parseEventDateTime(event.Attributes.DateStart || '');
  if (!startDateTime) return occurrences;
  
  // Если это минутная или часная регулярность, проверяем все вхождения в течение дня
  if (type === 'minutes' || type === 'hours') {
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const intervalMs = type === 'minutes' 
      ? 1000 * 60 * intervalNum 
      : 1000 * 60 * 60 * intervalNum;
    
    let currentOccurrence = new Date(startDateTime);
    
    // Находим первое вхождение после начала дня
    while (currentOccurrence < dayStart) {
      currentOccurrence = new Date(currentOccurrence.getTime() + intervalMs);
    }
    
    // Собираем все вхождения в течение дня
    while (currentOccurrence <= dayEnd) {
      occurrences.push(new Date(currentOccurrence));
      currentOccurrence = new Date(currentOccurrence.getTime() + intervalMs);
    }
  } else {
    // Для других типов регулярности проверяем только одно вхождение в день
    if (isRegularEventOnDate(event.Attributes.DateStart || '', event.Attributes.Regularity, targetDate)) {
      // Возвращаем время начала события
      const eventTime = new Date(targetDate);
      if (event.Attributes.TimeStart) {
        const [hours, minutes] = event.Attributes.TimeStart.split(':').map(Number);
        eventTime.setHours(hours, minutes, 0, 0);
      }
      occurrences.push(eventTime);
    }
  }
  
  return occurrences;
}

// Вспомогательные функции
function parseEventDateTime(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Парсим формат DD-MM-YY
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  
  let [day, month, year] = parts;
  year = year.length === 2 ? (parseInt(year) < 50 ? `20${year}` : `19${year}`) : year;
  
  return new Date(`${year}-${month}-${day}`);
}

function calculateMonthsDifference(from: Date, to: Date, interval: number): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return Math.ceil(months / interval) * interval;
}

// Форматирование регулярности для отображения
export function formatRegularity(regularity: string): string {
  if (!regularity || !regularity.includes(':')) return '';
  
  const [type, interval] = regularity.split(':');
  const intervalNum = parseInt(interval);
  
  if (isNaN(intervalNum) || intervalNum <= 0) return '';
  
  const typeNames = {
    minutes: intervalNum === 1 ? 'minute' : 'minutes',
    hours: intervalNum === 1 ? 'hour' : 'hours', 
    days: intervalNum === 1 ? 'day' : 'days',
    weeks: intervalNum === 1 ? 'week' : 'weeks',
    months: intervalNum === 1 ? 'month' : 'months',
    years: intervalNum === 1 ? 'year' : 'years'
  };
  
  return `Every ${intervalNum} ${typeNames[type as keyof typeof typeNames] || type}`;
}
