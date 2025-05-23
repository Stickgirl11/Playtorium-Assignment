import response from '../../../../../../public/shopping_category.json' 
export async function GET() {
    return Response.json(response, { status: 200})
  }
