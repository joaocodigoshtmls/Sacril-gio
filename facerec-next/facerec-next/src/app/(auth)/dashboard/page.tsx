export default function Dashboard() {
  return (
    <div className='max-w-5xl mx-auto'>
      <h2 className='text-2xl font-semibold'>Dashboard</h2>
      <div className='mt-4 grid grid-cols-2 gap-4'>
        <div className='rounded-xl border p-4'>
          <div className='text-sm opacity-70'>Reconhecimentos Hoje</div>
          <div className='text-4xl font-bold'>156</div>
        </div>
        <div className='rounded-xl border p-4'>
          <div className='text-sm opacity-70'>Precisão</div>
          <div className='text-4xl font-bold'>94.8%</div>
        </div>
      </div>
    </div>
  )
}
