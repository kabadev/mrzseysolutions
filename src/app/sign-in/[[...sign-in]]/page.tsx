"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { user } = useUser();

  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(`/`);
    }
  }, [user]);

  return (
    <div className="h-screen flex items-centers  p-4 ">
      <div className="hidden bg-primary/20 rounded-lg md:w-[50%] md:flex items-center justify-center mb-4">
        <Image
          src="/gimglogo.png"
          alt="logo"
          width={700}
          height={500}
          className="h-[150px] w-full object-cover"
        />
      </div>
      <div className="w-full md:w-[50%] ">
        <SignIn.Root>
          <SignIn.Step
            name="start"
            className="bg-card w-full p-6 rounded-md  flex flex-col gap-2 pb-6"
          >
            <h1 className="text-xl font-bold flex items-center justify-center gap-2 text-center">
              <Image
                src="/gimglogo.png"
                className="w-full h-[150px] -mt-8 object-cover"
                alt=""
                width={700}
                height={500}
              />
            </h1>
            <p className="text-center  mb-6">
              Generate and Manage Machine Readable Zone Passport
            </p>
            <h2 className="text-lg font-bold text-center">
              Sign in to your account
            </h2>
            <Clerk.GlobalError className="text-sm text-red-400" />
            <Clerk.Field name="identifier" className="flex flex-col gap-2 mb-4">
              <Clerk.Label className="text-md ">Email:</Clerk.Label>
              <Clerk.Input
                type="text"
                placeholder="Email. eg. abukeita@gmail.com"
                required
                className="p-3 rounded-sm ring-1 ring-gray-300"
              />
              <Clerk.FieldError className="text-xs text-red-400" />
            </Clerk.Field>

            <SignIn.Action
              submit
              className="bg-primary text-white my-1 rounded-md text-sm p-[10px]"
            >
              <Clerk.Loading>
                {(isLoading) => (isLoading ? "Loading..." : "Continue")}
              </Clerk.Loading>
            </SignIn.Action>
          </SignIn.Step>

          <SignIn.Step
            name="verifications"
            className="bg-card w-full p-6 rounded-md  flex flex-col gap-2"
          >
            <SignIn.Strategy name="email_code">
              <h1 className="text-xl font-bold flex items-center justify-center gap-2 text-center">
                <Image
                  src="/gimglogo.png"
                  className="w-full h-[150px] -mt-8 object-cover"
                  alt=""
                  width={700}
                  height={500}
                />
              </h1>
              <p className="text-center  mb-6">
                Generate and Manage Machine Readable Zone Passport
              </p>

              <h1 className="text-lg font-bold text-center">
                Check your email
              </h1>
              <p>
                We sent a code to <SignIn.SafeIdentifier />.
              </p>

              <Clerk.Field name="code">
                <Clerk.Label>Email code</Clerk.Label>
                <Clerk.Input className="p-3 rounded-sm ring-1 ring-gray-300" />
                <Clerk.FieldError className="text-xs text-red-400" />
              </Clerk.Field>

              <SignIn.Action
                className="bg-primary text-white my-1 rounded-md text-sm p-[10px]"
                submit
              >
                <Clerk.Loading>
                  {(isLoading) => (isLoading ? "Loading..." : "Continue")}
                </Clerk.Loading>
              </SignIn.Action>
            </SignIn.Strategy>

            <SignIn.Strategy name="password">
              <h1 className="text-xl font-bold flex items-center justify-center gap-2 text-center">
                <Image
                  src="/gimglogo.png"
                  className="w-full h-[150px] -mt-8 object-cover"
                  alt=""
                  width={700}
                  height={500}
                />
              </h1>
              <p className="text-center  mb-6">
                Generate and Manage Machine Readable Zone Passport
              </p>
              <h2 className="text-lg font-bold text-center">
                Enter your password
              </h2>
              <Clerk.Field name="password" className="flex flex-col gap-2 mb-4">
                <Clerk.Label className="text-md ">Password:</Clerk.Label>
                <Clerk.Input
                  type="password"
                  placeholder="Enter Password"
                  required
                  className="p-3 rounded-sm ring-1 ring-gray-300"
                />
                <Clerk.FieldError className="text-xs text-red-400" />
              </Clerk.Field>
              <SignIn.Action
                submit
                className="bg-primary text-white my-1 rounded-md text-sm p-[10px]"
              >
                <Clerk.Loading>
                  {(isLoading) => (isLoading ? "Loading..." : "Continue")}
                </Clerk.Loading>
              </SignIn.Action>
              <SignIn.Action
                navigate="forgot-password"
                className="text-blue-600"
              >
                Forgot password?
              </SignIn.Action>
            </SignIn.Strategy>

            <SignIn.Strategy name="reset_password_email_code">
              <h1 className="text-xl font-bold flex items-center justify-center gap-2 text-center">
                <Image
                  src="/gimglogo.png"
                  className="w-full h-[150px] -mt-8 object-cover"
                  alt=""
                  width={700}
                  height={500}
                />
              </h1>
              <p className="text-center  mb-6">
                Generate and Manage Machine Readable Zone Passport
              </p>
              <h2 className="text-lg font-bold text-center">
                Check your email
              </h2>
              <p>
                We sent a code to <SignIn.SafeIdentifier />.
              </p>

              <Clerk.Field name="code" className="flex flex-col gap-2 mb-4">
                <Clerk.Label>Email code</Clerk.Label>
                <Clerk.Input
                  placeholder="Enter code"
                  className="p-3 rounded-sm ring-1 ring-gray-300"
                />
                <Clerk.FieldError className="text-xs text-red-400" />
              </Clerk.Field>

              <SignIn.Action
                submit
                className="bg-primary text-white my-1 rounded-md text-sm p-[10px]"
              >
                <Clerk.Loading>
                  {(isLoading) => (isLoading ? "Loading..." : "Continue")}
                </Clerk.Loading>
              </SignIn.Action>
            </SignIn.Strategy>
          </SignIn.Step>

          <SignIn.Step
            name="forgot-password"
            className="bg-card w-full p-6 rounded-md  flex flex-col gap-2"
          >
            <h1 className="text-xl font-bold flex items-center justify-center gap-2 text-center">
              <Image
                src="/gimglogo.png"
                className="w-full h-[150px] -mt-8 object-cover"
                alt=""
                width={700}
                height={500}
              />
            </h1>
            <p className="text-center  mb-6">
              Generate and Manage Machine Readable Zone Passport
            </p>

            <SignIn.SupportedStrategy name="reset_password_email_code">
              <p className="text-blue-600">Reset password</p>
            </SignIn.SupportedStrategy>

            <SignIn.Action
              navigate="previous"
              className="bg-primary text-white my-1 rounded-md text-sm p-[10px]"
            >
              Go back
            </SignIn.Action>
          </SignIn.Step>
        </SignIn.Root>
      </div>
    </div>
  );
};

export default LoginPage;
