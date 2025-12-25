export function Panel(): JSX.Element {
    return (
        <div className="flex justify-between items-center w-full px-4 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md">
            <div>
                <button
                    className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
                    onClick={() => alert('Logout clicked (заглушка)')}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}
