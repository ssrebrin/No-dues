import "../WebCrumbs.css";


export const Loginn = () => {
  return (
	  <div className="absolute top-4 right-4 z-10">
	    <details className="relative inline-block">
	      <summary className="list-none cursor-pointer px-4 py-2 bg-primary-500 text-white rounded-lg font-medium shadow-md hover:bg-primary-600 transition-colors">
	        <span className="flex items-center">
	          <span className="material-symbols-outlined mr-2">person</span>
	          Account
	        </span>
	      </summary>
	      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20">
	        <div className="p-4">
	          <div className="mb-4 border-b">
	            <div className="flex gap-4 mb-2">
	              <button className="flex-1 py-2 font-medium border-b-2 border-primary-500 text-primary-700">Login</button>
	              <button className="flex-1 py-2 font-medium text-gray-500 hover:text-gray-700 transition-colors">Register</button>
	            </div>
	          </div>
	          
	          <form>
	            <div className="mb-3">
	              <label className="block text-sm font-medium mb-1">Email</label>
	              <input type="email" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" placeholder="your@email.com" />
	            </div>
	            <div className="mb-4">
	              <label className="block text-sm font-medium mb-1">Password</label>
	              <input type="password" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" placeholder="••••••••" />
	            </div>
	            <button type="submit" className="w-full py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors">
	              Login
	            </button>
	            <div className="mt-3 text-center text-sm text-gray-500">
	              <a href="#" className="text-primary-600 hover:underline">Forgot password?</a>
	            </div>
	          </form>
	        </div>
	      </div>
	    </details>
	  </div>
  )
}