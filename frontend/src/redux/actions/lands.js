import axios from "axios";
import { server } from "../../server";

//create lands

export const createLand =
 (
    name,description,address,landlocation,price,area,statusland,images,sellerId
) => async(dispatch) =>  {
    try{
        dispatch({
            type: "landsCreateRequest",
        });

        const { data } = await axios.post(`${server}/lands/create-lands`,
            name,
            description,
            address,
            landlocation,
            price,
            area,
            statusland,
            images,
            sellerId,
        );

        dispatch({
            type: "landsCreateSuccess",
            payload: data.lands,
        });
    }catch(error){
        dispatch({
            type: "landsCreateFail",
            payload: error.response.data.message,
        });
    };
};

//get All lands of the seller
export const getAllLandsShop = (id) => async (dispatch) => {
    try{
        dispatch({
            type: "getAllLandsShopRequest",
        });

        const { data } = await axios.get(
            `${server}/lands/get-all-lands/${id}`
        );

        dispatch({
            type: "getAllLandsShopSuccess",
            payload: data.lands,
        });
    }catch(error){
        dispatch({
            type: "getAllLandsShopFailed",
            payload: error.response.data.message,
        });
    };
};

//delete land of a seller
export const deleteLands = (id) => async (dispatch) =>{
    try{
        dispatch({
            type: "deleteLandsRequest",
        });

        const { data } = await axios.delete(
            `${server}/lands/delete-seller-land/${id}`,
            {
                withCredentials : true,
            }
        );

        dispatch({
            type: "deleteLandsSuccess",
            payload: data.message,
        });
    }catch(error){
        dispatch({
            type: "deleteLandsFailed",
            payload: error.response.data.message,
        });
    };
};

// get all lands
export const getAllLands = () => async (dispatch) => {
    try{
        dispatch({
            type: "getAllLandsRequest",
        });

        const { data } = await axios.get(`${server}/lands/get-all-lands`);
        
        dispatch({
            type: "getAllLandsSuccess",
            payload: data.lands,
        });
    }catch(error) {
        dispatch({
            type: "getAllLandsFailed",
            payload: error.response.data.message,
        });
    }
};
