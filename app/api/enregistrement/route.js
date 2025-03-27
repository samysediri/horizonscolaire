export async function GET() {
  return new Response(JSON.stringify({ message: 'API fonctionnelle!' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
