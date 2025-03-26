// /app/api/enregistrement/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const spaceId = searchParams.get('spaceId')

  if (!spaceId) {
    return new Response(JSON.stringify({ error: 'spaceId manquant' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const response = await fetch(`https://api.thelessonspace.com/v2/recordings/${spaceId}`, {
      headers: {
        Authorization: `Bearer cdee0709-2ffe-4758-a0b9-25f92f91c0a7`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erreur serveur : ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
