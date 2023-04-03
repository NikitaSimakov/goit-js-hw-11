import axios from 'axios';

export async function pixabayApi(request = 'cat', page = 1) {
  const response = axios.get(
    `https://pixabay.com/api/?key=34692070-b05e0f04a1e41f744928729e6&q=${request}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
  );
  const data = (await response).data;
  console.log(data);
  return data;
}
