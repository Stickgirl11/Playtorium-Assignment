import response from '../../../../../public/relation/cam-cam_cate-cam-param.json'
export async function GET() {
    return Response.json(response, { status: 200})
  }
