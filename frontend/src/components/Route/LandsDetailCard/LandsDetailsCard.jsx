import React, { useEffect, useState } from 'react'
import { RxCross1 } from 'react-icons/rx'
import { Link, useNavigate } from 'react-router-dom'
import styles from '../../../styles/styles'
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage } from 'react-icons/ai'
import { addToWishlist,removeFromWishlist } from '../../../redux/actions/wishlist'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { server } from '../../../server'
import { toast } from 'react-toastify'

const LandsDetailsCard = ({setOpen,data}) => {
    const {wishlist} = useSelector((state) => state.wishlist);
    const dispatch = useDispatch();
    const [click,setClick] = useState(false);
    const { user, isAuthenticated } = useSelector((state) => state.user);
    const navigate = useNavigate();

    const handleMessageSubmit = async () => {
        if (isAuthenticated) {
          const groupTitle = data._id + user._id;
          const userId = user._id;
          const sellerId = data.shop._id;
          await axios
            .post(`${server}/conversation/create-new-conversation`, {
              groupTitle,
              userId,
              sellerId,
            })
            .then((res) => {
              navigate(`/inbox?${res.data.conversation._id}`);
            })
            .catch((error) => {
              toast.error(error.response.data.message);
            });
        } else {
          toast.error("Please login to create a conversation");
        }
      };

    useEffect(() => {
        if(wishlist && wishlist.find((i) => i._id === data._id)){
            setClick(true);
        } else{
            setClick(false);
        }
    }, [wishlist]);

    const removeFromWishlistHandler = (data) => {
        setClick(!click);
        dispatch(removeFromWishlist(data));
    };

    const addToWishlistHandler = (data) => {
        setClick(!click);
        dispatch(addToWishlist(data));
    };
  return (
    <div className='bg-[#fff]'>
        { data ? (
            <div className='fixed w-full h-screen top-0 left-0 bg-[#00000030] z-40 flex items-center justify-center'>
                <div className="w-[90%] 800px:w-[60%] h-[90vh] overflow-y-scroll 800px:h-[75vh] bg-white rounded-md shadow-sm relative p-4">
                    <RxCross1 size={30} className="absolute right-3 top-3 z-50" onClick={() => setOpen(false)}/>
                    <div className='block w-full 800px:flex'>
                        <div className="w-full 800px:w-[50%]">
                            <img src={`${data.images && data.images[0]?.url}`} alt="" />
                            <div className="flex">
                                <Link to={`/shop/preview/${data.shop._id}`} className='flex'>
                                    <img src={`${data.images && data.images[0]?.url}`} alt="" className='w-[50px] h-[50px] rounded-full mr-2' />
                                    <div>
                                        <h3 className={`${styles.shop_name}`}>
                                            {data.shop.name}
                                        </h3>
                                        <h5 className="pb-3 text-[15px]">{data?.ratings} Ratings</h5>
                                    </div>
                                </Link>
                            </div>
                            <div className={`${styles.button} bg-[#000] mt-4 rounded-[4px] h-11`} onClick={handleMessageSubmit}>
                                <span className="flex items-center text-[#fff]">
                                    Send Message <AiOutlineMessage className='ml-1' />
                                </span>
                            </div>
                        </div>
                        <div className="w-full 800px:w-[50%] pt-5 pl-[5px] pr-[5px]">
                            <h1 className={`${styles.landsTitle} text-[20px]`}>{data.name}</h1>
                            <p>{data.description}</p>
                            <br/>
                            <br/>
                            <h3 className='font-[700] text-[17px]'>Address of the land owner</h3>
                            <p>{data.address}</p>
                            <div className="flex pt-3">
                                <h4 className={`${styles.landActualPrice}`}>{"₹"+ data.price}</h4>
                            </div>
                            <div className="flex itmes-center mt-12 justify-between pr-3">
                                <div>
                                    {click ? (
                                        <AiFillHeart 
                                            size={30}
                                            className='cursor-pointer'
                                            onClick={() => removeFromWishlistHandler(data)}
                                            title='Remove From wishlist' />
                                    ):(
                                        <AiOutlineHeart 
                                            size={30}
                                            className='cursor-pointer'
                                            onClick={() => addToWishlistHandler(data)}
                                            title='Add to wishlist' /> 
                                    )} Add or Remove from the wishlist
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : null}
    </div>
  )
}

export default LandsDetailsCard