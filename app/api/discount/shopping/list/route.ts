import response from '../../../../../public/relation/shopping-shopping_category.json'
export async function GET() {
    return Response.json(response, { status: 200})
  }
