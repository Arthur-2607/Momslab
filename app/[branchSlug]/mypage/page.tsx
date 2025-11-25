import { MyPageClient } from "./mypage-client"

interface MyPageProps {
  params: Promise<{ branchSlug: string }>
}

export default async function MyPage({ params }: MyPageProps) {
  const { branchSlug } = await params
  return <MyPageClient branchSlug={branchSlug} />
}
