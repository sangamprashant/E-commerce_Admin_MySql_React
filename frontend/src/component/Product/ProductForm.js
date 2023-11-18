
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../Firebase";
import { json, useNavigate } from "react-router-dom";
import { AdminContext } from "../../AdminContext";

const ProductForm = ({_id,title,description,price,images,category,properties}) => {
  const { user, setUser, token, setToken } = useContext(AdminContext);
  const [productDetails, setProductDetails] = useState({
    title: title || "",
    description: description || "",
    price: price || 0,
    images: images ? JSON.parse(images) : [],
    category: category || null,
    properties: properties ? JSON.parse(properties) : [],
    selectedProperty: "",
    selectedParent: "",
  });
    const [isUploading, setIsuploading] = useState(false)
    const [categories,setCategories]=useState([])
    const [allProperties,setAllProperties]=useState([])
    const navigate = useNavigate();

    useEffect(()=>{
        fetchCategories()
        fetchProperties()
    },[])

    const fetchCategories = async () =>{
      await axios.get("/api/categories",
        {
          headers: {
            Authorization: "Bearer " + token, // Set the Authorization header
          },
        }
      ).then((result) => {
        console.log(result.data)
        setCategories(result.data);
      });
    }
    const fetchProperties = async () =>{
      await axios.get("/api/properties",
        {
          headers: {
            Authorization: "Bearer " + token, // Set the Authorization header
          },
        }
      ).then((result) => {
        console.log(result.data)
        setAllProperties(result.data);
      });
    }

    const handelInput =(e)=>{
        setProductDetails({...productDetails,[e.target.name]:e.target.value})
    }

    const handleSave = async (e) => {
      e.preventDefault();
      if (_id) {
        // Update the selected product
        await axios.put(`/api/products/${_id}`, {...productDetails}, {
          headers: {
            Authorization: "Bearer " + token, // Set the Authorization header
          },
        });
      } else {
        // Save a new product
        await axios.post("/api/products", productDetails, {
          headers: {
            Authorization: "Bearer " + token, // Set the Authorization header
          },
        });
      }
      navigate("/products");
    };

    async function selectImages(e) {
        const files = e.target?.files;
        if (files && files.length > 0) {
            setIsuploading(true)
            for (let i = 0; i < files.length; i++) {
                const fileRef = ref(storage, `images/${files[i].name + Date.now()}`);
                try {
                  const snapshot = await uploadBytes(fileRef, files[i]);
                  const url = await getDownloadURL(snapshot.ref);
                  setProductDetails((prevData) => ({
                    ...prevData,
                    images: [...(prevData?.images || []), url], // Provide a default empty array
                  }));
                } catch (error) {
                  console.error("Error uploading image:", error);
                }
            }
            setIsuploading(false)
        }
    }
      
    function reOrderedList(images){
        setProductDetails({...productDetails,images:images})
    }

    const handlePropertySelect = (property) => {
      // Check if the property is already in the array
      const propertyIndex = productDetails.properties.findIndex((prop) => prop.name === property.name);
    
      if (propertyIndex !== -1) {
        // If the property is already in the array, remove it
        const updatedProperties = productDetails.properties.slice();
        updatedProperties.splice(propertyIndex, 1);
    
        setProductDetails((prevData) => ({
          ...prevData,
          properties: updatedProperties,
        }));
      } else {
        // If the property is not in the array, add it
        setProductDetails((prevData) => ({
          ...prevData,
          properties: [...prevData.properties, { name: property.name, parent: property.parent }],
        }));
      }
    };
    
  return (
    <form onSubmit={handleSave}> 
        <label>Product Name</label>
        <input type="text" placeholder="product name" name="title" value={productDetails.title} onChange={handelInput} />
        <label>Product Category</label>
        <select name="category" value={productDetails?.category || ""} onChange={handelInput}>
          <option value="">Uncategorized</option>
          {categories&&categories.map(catagory=>(
            <option key={catagory._id} value={catagory.name}>{catagory.name}</option>
          ))}
        </select>
        <label>Product properties</label>
        <table className="table-basic">
        <thead>
          <tr>
            <td>Name</td>
            <td>Parent</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
        {allProperties.map((property, index) => (
        <tr key={index}>
          <td>{property.name}</td>
          <td>{property.parent}</td>
          <td>
            <button type="button" className={`btn ${productDetails.properties.some((prop) => prop.name === property.name)?"bg-red-500":"bg-blue-500"} rounded-sm text-white p-2`} onClick={() => handlePropertySelect(property)}>
              {productDetails.properties.some((prop) => prop.name === property.name) ? "Remove" : "Select"}
            </button>
          </td>
        </tr>
        ))}
        </tbody>
      </table>


        <label>Images</label>
        <div className="mb-2 flex">
            <ReactSortable list={productDetails?.images || []} setList={reOrderedList} className="flex felx-wrap">
              {!!productDetails?.images && productDetails?.images.map((link) => (
                <div className="mx-1" key={link}>
                  <img className="inline-block h-24" src={link} alt="Product" />
                </div>
              ))}
            </ReactSortable>
                
            {isUploading ? (
              <label className="mx-2 w-24 h-24 text-center flex flex-col items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200 cursor-progress">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <div>Loading...</div>
              </label>
            ) : (
              <label className="mx-2 w-24 h-24 text-center flex flex-col items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <div>Upload</div>
                <input type="file" multiple onChange={selectImages} className="hidden" />
              </label>
            )}
        </div>
        <label>Product Description</label>
        <textarea placeholder="description" name="description" value={productDetails.description} onChange={handelInput}></textarea>
        <label>Product Price (in Rupees)</label>
        <input type="number" placeholder="product price" name="price" value={productDetails.price} onChange={handelInput}/>
        <button className="btn-primary" type="submit" disabled={isUploading}>{isUploading?"Please wait..":"Save"}</button>
    </form>
  );
};

export default ProductForm;
