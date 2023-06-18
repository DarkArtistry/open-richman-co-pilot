"use client"
import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './page.module.css'
import { styled } from '@mui/system';

const CustomAccordion = styled(Accordion)({
  color: 'rgba(236,236,241,1)',
  background: 'rgba(68,70,84,1)',
  });

export default function Introduction() {
  return (
    <div className={styles.introduction}>
      <CustomAccordion className={styles.accordian}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Introduction</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <Typography variant="body1" gutterBottom>
          Open Richman Co-pilot (ORC) is an open-source platform designed for secure and privacy-focused investment portfolio management. Funded by Amanda from Top-Value, ORC operates locally on your machine, providing user control over data and privacy. It offers a range of features for all investment levels, and its open-source nature encourages community contributions. Amanda&apos;s generous funding has been pivotal in bringing this tool to the public.
        </Typography>
        <br/><br/>
        <Typography variant="body1" gutterBottom>
          To start using ORC, follow these steps:
        </Typography>
        <br/><br/>
        <Typography variant="body1" gutterBottom>
          1. Select your desired price tickers.
        </Typography>
        <Typography variant="body1" gutterBottom>
          2. Fill up the required input parameters; if any field is empty, input &apos;0&apos;.
        </Typography>
        <Typography variant="body1" gutterBottom>
          3. Generate the report.
        </Typography>
        <Typography variant="body1" gutterBottom>
          4. For enhanced security, generate a random secret key and store it securely.
        </Typography>
        <Typography variant="body1">
          5. Export the encrypted ORC file for future use.
        </Typography>
        <br/><br/>
        <Typography variant="body1">
          When you wish to import the encrypted file in the future, make sure to enter your secret key first. This ensures your data remains secure and accessible only by you.
        </Typography>
        </AccordionDetails>
      </CustomAccordion>
    </div>
  );
}