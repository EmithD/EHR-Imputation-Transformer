import HeaderFooter from '@/components/header_footer'
import React from 'react'

const Impute = () => {
  return (
    <HeaderFooter>

        <div className="container mx-auto py-12 px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Welcome to My Application</h1>
            
            <p className="mb-4 text-center max-w-3xl mx-auto">
            This is an example of how to use the reusable header and footer component.
            You can place any content inside the HeaderFooter component and it will appear
            between the header and footer.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
                <div className="border rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3">Feature One</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
                </div>
                
                <div className="border rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3">Feature Two</h2>
                    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.</p>
                </div>
                
                <div className="border rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3">Feature Three</h2>
                    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                </div>
            </div>
        </div>
        
    </HeaderFooter>
  )
}

export default Impute
