import router from "./router";
import "./style/index.css"
import {  RouterProvider } from 'react-router-dom';
import { ToastContainer } from "./components/utils/ToastContainer";
import { toast } from "./utils/toast";


function App() {
  return (
    <div className="">
      <main className="">
        <RouterProvider router={router}/>
      </main>
      <ToastContainer toastManager={toast} />
    </div>
  )
}

export default App
