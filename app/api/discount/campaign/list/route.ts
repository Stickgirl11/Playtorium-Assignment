import response from '../../../../../public/relation/campaign-campaign_category.json'
export async function GET() {
    return Response.json(response, { status: 200})
  }
