import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from '../../../styles/styles'
import { AiFillHeart, AiOutlineEye, AiOutlineHeart } from 'react-icons/ai'
import LandsDetailsCard from '../LandsDetailCard/LandsDetailsCard'
import { useDispatch, useSelector } from 'react-redux'
import { addToWishlist, removeFromWishlist } from '../../../redux/actions/wishlist'

const LandsCard = ({data,isEvent}) => {
    const { wishlist } = useSelector((state) => state.wishlist);
    const [click,setClick] = useState(false);
    const [open,setOpen] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if(wishlist && wishlist.find((i) => i._id === data._id)){
            setClick(true);
        }else{
            setClick(false);
        }
    },[wishlist]);

    const removeFromWishlistHandler = (data) => {
        setClick(!click);
        dispatch(removeFromWishlist(data));
      };
    
      const addToWishlistHandler = (data) => {
        setClick(!click);
        dispatch(addToWishlist(data));
      };
    
  return (
    <>
    <div className='w-full h-[350px] bg-white rounded-lg shadow-md p-3 relative cursor-pointer'>
        <div className="flex justify-end"></div>
        <Link to={`${isEvent === true ? `/lands/${data._id}?isEvent=true` : `/lands/${data._id}`}`}>
            <img src={`${data.images && data.images[0]?.url}`} alt='' className='w-full h-[170px] object-contain'/>
        </Link>
        <Link to={`/shop/preview/${data?.shop._id}`}>
            <h5 className={`${styles.shop_name}`}>{data.shop.name}</h5>
        </Link>
        <Link to={`${isEvent === true ? `lands/${data._id}?isEvent=true` : `/lands/$${data._id}`}`}>
            <h4 className="pb-3 font-[500]">
                {data.name.lenght > 40 ? data.name.slice(0,40)+ "..." : data.name}
            </h4>
            <div className="py-2 flex items-center justify-between">
                <div className="flex">
                    <h5 className={`${styles.landActualPrice}`}>
                        ₹ {data.price}
                    </h5>
                </div>
            </div>
        </Link>

        {/*side option */}
        <div>
        {click ? (
            <AiFillHeart
              size={22}
              className="cursor-pointer absolute right-2 top-5"
              onClick={() => removeFromWishlistHandler(data)}
              color={click ? "red" : "#333"}
              title="Remove from wishlist"
            />
          ) : (
            <AiOutlineHeart
              size={22}
              className="cursor-pointer absolute right-2 top-5"
              onClick={() => addToWishlistHandler(data)}
              color={click ? "red" : "#333"}
              title="Add to wishlist"
            />
          )}
          <AiOutlineEye
            size={22}
            className="cursor-pointer absolute right-2 top-14"
            onClick={() => setOpen(!open)}
            color="#333"
            title="Quick view"
          />
          {open ? <LandsDetailsCard setOpen={setOpen} data={data} /> : null}
        </div>
    </div>
    </>
  )
}

export default LandsCard;