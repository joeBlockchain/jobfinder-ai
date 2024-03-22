/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/NIzAxk2bYsu
 */
import Link from "next/link"

export function job-posting-card() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="shadow-lg rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Senior Frontend Developer</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-300">XYZ Corporation</p>
            <p className="mt-1 text-gray-500 dark:text-gray-400">San Francisco, CA</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-700 dark:text-gray-200">
              We are looking for a Senior Frontend Developer with experience in building high-performing, scalable,
              enterprise-grade applications. You will be part of a talented software team that works on mission-critical
              applications.
            </p>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button className="mr-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
              <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            </div>
            <Link className="text-blue-500 hover:text-blue-700" href="#">
              Read More
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}