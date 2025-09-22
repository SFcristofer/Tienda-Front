import React from 'react';
import WelcomeBanner from './WelcomeBanner.jsx';
import { ProductList } from './ProductList.jsx';

function HomePageContent() {
  return (
    <>
      <WelcomeBanner />
      <ProductList />
    </>
  );
}

export default HomePageContent;