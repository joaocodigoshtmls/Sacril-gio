export default function Page() {
  return (
    <div className='max-w-3xl mx-auto'>
      <h1 className='text-3xl font-semibold'>FaceRec Web (Next.js)</h1>
      <p className='mt-2 opacity-80'>Escolha um módulo:</p>
      <ul className='mt-4 list-disc pl-6 space-y-2'>
        <li><a className='underline' href='/(auth)/dashboard'>Dashboard</a></li>
        <li><a className='underline' href='/(auth)/monitoramento'>Monitoramento</a></li>
      </ul>
    </div>
  )
}
