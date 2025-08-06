import { useState } from 'react'
import { Route, Switch } from 'wouter'
import Chat from './pages/Chat'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/" component={Chat} />
        <Route path="/chat" component={Chat} />
        <Route>
          <div className="flex items-center justify-center min-h-screen">
            <h1 className="text-2xl font-semibold">Page Not Found</h1>
          </div>
        </Route>
      </Switch>
    </div>
  )
}

export default App