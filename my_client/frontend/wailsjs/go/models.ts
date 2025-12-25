export namespace main {
	
	export class EventAttributes {
	    Name?: string;
	    TimeStart: string;
	    TimeEnd?: string;
	    DateStart?: string;
	    DateEnd?: string;
	    Location?: string;
	    Regularity?: string;
	    BgColor: string;
	    LegendMark: string;
	    Interval?: string;
	    DetachOnCal?: string;
	
	    static createFrom(source: any = {}) {
	        return new EventAttributes(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.TimeStart = source["TimeStart"];
	        this.TimeEnd = source["TimeEnd"];
	        this.DateStart = source["DateStart"];
	        this.DateEnd = source["DateEnd"];
	        this.Location = source["Location"];
	        this.Regularity = source["Regularity"];
	        this.BgColor = source["BgColor"];
	        this.LegendMark = source["LegendMark"];
	        this.Interval = source["Interval"];
	        this.DetachOnCal = source["DetachOnCal"];
	    }
	}
	export class Event {
	    ID?: string;
	    name: string;
	    event_type: string;
	    description: string;
	    event_attributes: EventAttributes;
	
	    static createFrom(source: any = {}) {
	        return new Event(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.name = source["name"];
	        this.event_type = source["event_type"];
	        this.description = source["description"];
	        this.event_attributes = this.convertValues(source["event_attributes"], EventAttributes);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Subtask {
	    event_id?: number;
	    name: string;
	    state: string;
	
	    static createFrom(source: any = {}) {
	        return new Subtask(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.event_id = source["event_id"];
	        this.name = source["name"];
	        this.state = source["state"];
	    }
	}
	export class UpdateField {
	    field?: string;
	    newVal?: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateField(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.field = source["field"];
	        this.newVal = source["newVal"];
	    }
	}

}

