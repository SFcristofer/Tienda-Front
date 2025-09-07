import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tab, Tabs, Typography, Container } from '@mui/material';
import CategorySponsors from './monetization/CategorySponsors';
import StoreMonetizationManager from './monetization/StoreMonetizationManager';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`monetization-tabpanel-${index}`}
      aria-labelledby={`monetization-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MonetizationPanel = () => {
  const { t } = useTranslation();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 2 }}>
        {t('monetizationPanel')}
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="monetization tabs">
            <Tab label={t('storeMonetization')} />
            <Tab label={t('categorySponsors')} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <StoreMonetizationManager />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <CategorySponsors />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default MonetizationPanel;
