function App() {
  return (
    <div className="flex justify-center items-center h-screen w-screen bg-[#1a1a1a]">
      <div className="flex flex-col justify-start items-center h-3/6 w-4/5 bg-[#1a1a1a] overflow-hidden">
        <div className="bg-gradient-to-r from-zinc-700 to-gray-500 flex justify-center items-center h-auto w-full rounded-lg p-4">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg h-auto w-full p-4">
            {/* Sticky Admin Dashboard */}
            <h1 className="sticky top-0 bg-[#1a1a1a] bg-gradient-to-r from-zinc-700 to-gray-500 text-center font-mono text-4xl mt-3 text-cyan-500 p-4 rounded-lg">
              Admin Dashboard
            </h1>
            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[300px] p-4 h-5/6">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
