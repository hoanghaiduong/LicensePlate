import Footer from "./components/Footer"
import Hero from "./components/Hero"
import Navbar from "./components/Navbar"
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes } from 'react-router-dom'
import AddPatient from './components/patients/AddPatient'
import SearchPatient from "./components/patients/SearchPatient";
import Services from "./components/Services"
import { ToastContainer, toast } from 'react-toastify';
import ContactUs from "./components/ContactUs";
import { SharedDataProvider } from "./context/StateContext";

function App() {
  return (
    <SharedDataProvider>
      <div>
        <ToastContainer position='top-center' />
        <Navbar />
        <Routes>
          <Route path="/" exact element={<Hero />}></Route>
          <Route path="/addpatient" exact element={<AddPatient />} ></Route>
          <Route path="/searchpatient" exact element={<SearchPatient />} ></Route>
          <Route path="/services" exract element={<Services />}></Route>
          <Route path="/contactus" exact element={<ContactUs />}></Route>
        </Routes>
        <Footer />
      </div>
    </SharedDataProvider>
  )
}

export default App
