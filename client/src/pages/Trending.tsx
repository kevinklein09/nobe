import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import axios from 'axios';

import AspectRatio from '@mui/joy/AspectRatio';
import Card from '@mui/joy/Card';
import CardOverflow from '@mui/joy/CardOverflow';
import Divider from '@mui/joy/Divider';
import Typography from '@mui/joy/Typography';
import Link from '@mui/joy/Link';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { FormControl, InputLabel } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BigBook from '../components/Book/BookBig';
import UserContext from '../hooks/Context';
import TrendingWishlistButton from '../components/Button/TrendingWishlistButton';
import TrendingLendingLibraryButton from '../components/Button/TrendingLendingLibraryButton';

function Trending() {
  const [trending, setTrending] = useState<any[]>([]);
  const [showBigBook, setShowBigBook] = useState<any>(false);
  const [book1, setBook1] = useState<any>(null);

  const userContext = useContext(UserContext);
  const user = userContext?.user;

  const userId = user?.id;

  async function fetchTrending(category: string) {
    const response = await fetch(`/api/trending?category=${category}`);
    const data = await response.json();
    setTrending(data.results.books);
  }

  function handleSelect(event: SelectChangeEvent<string>) {
    fetchTrending(event.target.value);
  }

  const openBigBook = (obj: any) => {
    // setShowBigBook(true);
    // setBook1(obj);
    const { isbn10 } = obj.isbns[0];
    axios.post('/api/trending/inventory', {
      title: obj.title,
      id: userId,
      color: 'black',
      type: 'added to db',
      isbn10,
    }).then((response) => {
      console.log('response1', response.data);
      axios.get(`/bookdata/?ISBN10=${response.data}`)
        .then((response2) => {
          console.log('response2', response2.data);
          setBook1(response2.data);
          setShowBigBook(true);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  };

  if (showBigBook) {
    console.log(book1);
    return (
      <BigBook book={book1} id={userId} onClose={() => setShowBigBook(false)} />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>NYT Best Sellers</h1>
      <FormControl sx={{ width: '90%' }}>
        <InputLabel>Category</InputLabel>
        <Select
          onChange={handleSelect}
        >
          <MenuItem value="none">None</MenuItem>
          <MenuItem value="combined-print-and-e-book-fiction">Combined Print and e-Book Fiction</MenuItem>
          <MenuItem value="combined-print-and-e-book-nonfiction">Combined Print and e-Book Nonfiction</MenuItem>
          <MenuItem value="hardcover-fiction">Hardcover Fiction</MenuItem>
          <MenuItem value="hardcover-nonfiction">Hardcover Nonfiction</MenuItem>
          <MenuItem value="trade-fiction-paperback">Paperback Trade Fiction</MenuItem>
          <MenuItem value="paperback-nonfiction">Paperback Nonfiction</MenuItem>
          <MenuItem value="advice-how-to-and-miscellaneous">Advice How-To and Miscellaneous</MenuItem>
          <MenuItem value="childrens-middle-grade-hardcover">Childrens Middle Grade Hardcover</MenuItem>
          <MenuItem value="childrens-middle-grade-paperback">Childrens Middle Grade Paperback</MenuItem>
          <MenuItem value="picture-books">Childrens Picture Books</MenuItem>
          <MenuItem value="series-books">Childrens Series Books</MenuItem>
          <MenuItem value="audio-fiction">Audio Fiction</MenuItem>
          <MenuItem value="audio-nonfiction">Audio Nonfiction</MenuItem>
          <MenuItem value="business-books">Business Books</MenuItem>
          <MenuItem value="graphic-books-and-manga">Graphic Books and Manga</MenuItem>
          <MenuItem value="mass-market-monthly">Mass Market Monthly</MenuItem>
          <MenuItem value="middle-grade-paperback-monthly">Middle Grade Paperback Monthly</MenuItem>
          <MenuItem value="young-adult-paperback-monthly">Young Adult Paperback Monthly</MenuItem>
        </Select>
      </FormControl>
      <div style={{
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', overflowY: 'auto', maxWidth: '100%', maxHeight: 'calc(100vh - 200px',
      }}
      >
        {trending.length === 0 ? (
          <div />
        ) : (
          trending.map((book) => (
            <Card variant="outlined" key={book.primary_isbn10} sx={{ width: 380, margin: '10px' }}>
              <CardOverflow>
                <AspectRatio ratio="2">
                  <img
                    src={book.book_image}
                    loading="lazy"
                    alt=""
                  />
                </AspectRatio>
                <TrendingLendingLibraryButton book={book} />
                <TrendingWishlistButton book={book} />
              </CardOverflow>
              <Typography
                onClick={() => openBigBook(book)}
                level="h2"
                sx={{
                  fontSize: 'md', mt: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', '-webkit-line-clamp': 2, '-webkit-box-orient': 'vertical',
                }}
              >
                <Link href="#multiple-actions" overlay underline="none">
                  {book.title.charAt(0).toUpperCase() + book.title.slice(1).toLowerCase()}
                </Link>
              </Typography>
              <Typography
                level="body2"
                sx={{
                  mt: 0.5, mb: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >
                <Link href="#multiple-actions">{book.author}</Link>
              </Typography>
              <Divider inset="context" />
              <CardOverflow
                variant="soft"
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  py: 1.5,
                  px: 'var(--Card-padding)',
                  bgcolor: 'background.level1',
                }}
              >
                <Typography level="body3" sx={{ fontWeight: 'md', color: 'text.secondary', fontSize: 'md' }}>
                  {book.rank}
                </Typography>
                <Divider orientation="vertical" />
                <Typography level="body3" sx={{ fontWeight: 'md', color: 'text.secondary' }}>
                  {book.rank > book.rank_last_week ? <TrendingUpIcon sx={{ color: 'green', fontSize: 'md' }} /> : book.rank < book.rank_last_week ? <TrendingDownIcon sx={{ color: 'red', fontSize: 'md' }} /> : <TrendingFlatIcon sx={{ color: 'grey', fontSize: 'md' }} />}
                </Typography>
                <Divider orientation="vertical" />
                <Typography level="body3" sx={{ fontWeight: 'md', color: 'text.secondary', fontSize: 'md' }}>
                  {book.weeks_on_list}
                  <WhatshotIcon sx={{ color: 'orange', fontSize: 'md' }} />
                </Typography>
              </CardOverflow>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default Trending;
