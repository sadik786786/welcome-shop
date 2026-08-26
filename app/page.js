import { createClient } from "@/app/lib/supabase/server";
import Hero from "@/components/Hero";
export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className=" bg-black">
     <Hero user={user} />
    </div>
  );
}