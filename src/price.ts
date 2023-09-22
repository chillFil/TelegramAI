import { Axios } from 'axios';

const X_RAPIDAPI_KEY = process.env

export async function price (ctx) {
  let msg = ctx.message.text
  msg.replace("/price ", "")
  
  const options = {
    method: 'GET',
    url: 'https://real-time-product-search.p.rapidapi.com/product-offers',
    params: {
      q: msg,
      country: 'italy',
      language: 'italian',
      currency: 'eur'
    },
    headers: {
      'X-RapidAPI-Key': X_RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'real-time-product-search.p.rapidapi.com'
    }
  };

  try {
    const response = await Axios.call(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}