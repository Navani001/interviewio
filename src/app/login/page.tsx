import { GoogleSign, SignIn, SignOut } from "@/component";
export default function LoginPage() {
    return <div className="bg-red-900"><SignIn/><GoogleSign /><SignOut/></div>;
}
