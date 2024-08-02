import React, { useEffect, useState } from 'react'
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createLand } from "../../redux/actions/lands";

const CreateLand = () => {
    const{ seller } = useSelector((state) => state.seller);
    const{ success, error } = useSelector((state) => state.lands);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const[name,setName] = useState("");
    const[description,setDescription] = useState("");
    const [statusland, setStatusland] = useState("");
    const[address,setAddress] = useState("");
    const[landlocation,setlandlocation] = useState("");
    const[price,setPrice] = useState();
    const[area,setArea] = useState("");
    const[images,setImages] = useState([]);

  useEffect(() => {
       if(error){
            toast.error(error);
        }
        if(success){
            toast.success("Land added successfully!");
            navigate("/dashboard");
            window.location.reload();
        }
    });
    

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        setImages([]);

        files.forEach((file) => {
            const reader = new FileReader();

            reader.onload = () => {
                if(reader.readyState === 2) {
                    setImages((old) => [...old, reader.result]);
                }
            };
            reader.readAsDataURL(file);
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault();

        const newForm = new FormData();

        images.forEach((image) => {
            newForm.set("images",image);
        });
        newForm.append("name",name);
        newForm.append("description",description);
        newForm.append("statusland",statusland);
        newForm.append("address",address);
        newForm.append("landlocation",landlocation);
        newForm.append("price",price);
        newForm.append("area",area);
      newForm.append("sellerId", seller._id);
        dispatch(
            createLand({
              name,
              description,
              statusland,
              address,
              landlocation,
              price,
              area,
              sellerId:seller._id,
             images,
            })
          );

    }
  return (
    <div className="w-[100%] 800px:w-[50%] bg-white  shadow h-[80vh] rounded-[4px] p-3 overflow-y-scroll">
        <h5 className="text-[25px] font-Poppins text-center">Add your land here!</h5>
        {/* create land form */}
        <form onSubmit={handleSubmit}>
            <br />
            <div>
                <label className='pb-2'>
                    Name of the owner <span className='text-red-500'>*</span>
                </label>
                <input type='text' name='name' value={name} 
                    className='mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Enter the name of the owner...' /> 
            </div>
            <br />
            <div>
                <label className='pb-2'>
                    Description of the land <span className='text-red-500'>*</span>
                </label>
                <textarea
                 cols="30"
                 required
                rows="4"
                type="text"
                 name="description"
                 value={description}
                className="mt-2 appearance-none block w-full pt-2 px-3 border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter land description description..."
                    ></textarea>
          </div>
          <br/>
          
            <div>
                <label className='pb-2'>
                    Giving land for ?? <span className='text-red-500 pr-[100px]'>*</span>
                </label>
                <label className='pr-[100px]'>
                <input type='radio'  value="sale" checked={statusland === 'sale'} onChange={(e) => setStatusland(e.target.value)}/>
                Sale
                </label>
                <label>
                <input type='radio'  value="lease" checked={statusland === 'lease'} onChange={(e) => setStatusland(e.target.value)}/>
                Lease
                </label>
            </div>
            <br/>
          <div>
                <label className='pb-2'>
                    Address of the land Owner <span className='text-red-500'>*</span>
                </label>
                <textarea
                 cols="30"
                 required
                rows="4"
                type="text"
                 name="address"
                 value={address}
                className="mt-2 appearance-none block w-full pt-2 px-3 border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter the address of the owner..."
                    ></textarea>
          </div>
          <br/>
          <div>
                <label className='pb-2'>
                    Location of the land <span className='text-red-500'>*</span>
                </label>
                <input type='text' name='landlocation' value={landlocation} 
                    className='mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    onChange={(e) => setlandlocation(e.target.value)}
                    placeholder='Enter the location of the land...' /> 
        </div>
        <br />
        <div>
                <label className='pb-2'>
                    Asking Price of the land <span className='text-red-500'>*</span>
                </label>
                <input type='number' name='price' value={price} 
                    className='mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder='Enter the price of the land...' /> 
            </div>
            <br />
            <div>
                <label className='pb-2'>
                    Area of the land<span className='text-red-500'>*</span>
                </label>
                <input type='number' name='area' value={area} 
                    className='mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    onChange={(e) => setArea(e.target.value)}
                    placeholder='Enter the total area of the land...' /> 
            </div>
            
            <br/>
            <div>
                <label className='pb-2'>
                    Upload Images<span className='text-red-500'>*</span>
                </label>
                <input 
                    type='file'
                    name=""
                    id="upload"
                    className='hidden'
                    multiple
                    onChange={handleImageChange}/>
                <div className='w-full flex items-center flex-wrap'>
                    <label htmlFor='upload'>
                        <AiOutlinePlusCircle size={30} className='mt-3' color='#555' />
                    </label>
                    {
                        images && 
                        images.map((i) => (
                            <img 
                                src={i}
                                key={i}
                                alt=''
                                className='h-[120px] w-[120px] object-cover m-2' />
                        ))
                    }
                </div>
                <br />
                <div>
                <input
                type="submit"
                value="Create"
                className="mt-2 cursor-pointer appearance-none text-center block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            </div>
        </form>
    </div>
  )
}

export default CreateLand;