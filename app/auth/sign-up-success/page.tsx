// import {
//   Card,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// export default function Page() {
//   return (
//     <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
//       <div className="w-full max-w-sm">
//         <div className="flex flex-col gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-2xl">
//                 Thank you for signing up!
//               </CardTitle>
//             </CardHeader>

//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client"

import { useRouter } from "next/navigation"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Page() {
  const router = useRouter()

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Thank you for signing up!
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push("main/match")}
              >
                Continuar
              </Button>
            </CardContent>

          </Card>
        </div>
      </div>
    </div>
  )
}
