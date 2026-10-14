import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Store from "./redux/store";
import { loadSeller, loadUser } from "./redux/actions/user";
import { getAllProducts } from "./redux/actions/product";
import { getAllLands } from "./redux/actions/lands";
import axios from "axios";
import { server } from "./server";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const [stripeApikey, setStripeApiKey] = useState("");

  async function getStripeApikey() {
    try {
      const { data } = await axios.get(`${server}/payment/stripeapikey`);
      if (data?.stripeApikey) {
        setStripeApiKey(data.stripeApikey);
      }
    } catch (err) {
      // Stripe API key optional during general navigation
    }
  }

  useEffect(() => {
    Store.dispatch(loadUser());
    Store.dispatch(loadSeller());
    Store.dispatch(getAllProducts());
    Store.dispatch(getAllLands());
    getStripeApikey();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes stripeApikey={stripeApikey} />
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </BrowserRouter>
  );
};

export default App;
