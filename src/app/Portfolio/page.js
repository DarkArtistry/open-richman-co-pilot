"use client"
import React, { useState, useRef, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './page.module.css';
import { Select, MenuItem, InputLabel, FormControl, TextField, 
    Accordion, AccordionSummary, AccordionDetails,
    Typography, Button, Grid, Divider, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { styled } from '@mui/system';
import CryptoJS from 'crypto-js';
import ReactEcharts from "echarts-for-react"


const StyledSelect = styled(Select)({
    '& .MuiSelect-select.MuiSelect-select': {
        color: 'white',
    },
    '& .MuiFormLabel-root': {
        color: 'white',
    },
    '& .MuiFormLabel-root.Mui-focused': {
        color: 'white',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: 'white',
    },
    '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
            borderColor: 'white',
        },
    },
});

const StyledDataGrid = styled(DataGrid)({
    '& .MuiDataGrid-row': {
        height: '25px',
    },
    '& .MuiDataGrid-cell': {
        padding: '0 4px',
      },
});

const StyledTextField = styled(TextField)({
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "white",
      },
      "&:hover fieldset": {
        borderColor: "white",
      },
      "&.Mui-focused fieldset": {
        borderColor: "white",
      },
    },
    "& .MuiInputBase-input": {
      color: "white"
    },
    "& .MuiFormLabel-root": {
      color: "white"
    }
  });

const CustomAccordion = styled(Accordion)({
color: 'rgba(236,236,241,1)',
background: 'rgba(68,70,84,1)',
});

export default function Portfolio() {
    const [fileData, setFileData] = useState(null);
    const fileInput = useRef(null);
    const buttonRef = useRef();
    const [pieChartOptions, setPieChartOptions] = useState({});

    const [initialPrincipal, setInitialPrincipal] = useState(0)
    const [additionalSubscription, setAdditionalSubscription] = useState(0)
    const [additionalRedemption, setAdditionalRedemption] = useState(0)
    const [usdtLiquidityShortPosition, setUsdtLiquidityShortPosition] = useState(0)
    const [secretKey, setSecretKey] = useState('');

    const [liquidityPosition, setLiquidityPosition] = useState({
        non_liquidity_short_positions: 0, // 1 == 100%, 1 - liquid
        liquid_short_positions: 0, // usdt_liquidity_short_position / (sum of market cap valuations on all positions + usdt_liquidity_short_position)
    })

    const [binanceTickers, setBinanceTickers] = useState([])
    const [selectedBinanceTickers, setSelectedBinanceTickers] = useState([])
    
    const [totalPositionRatio, setTotalPositionRatio] = useState({})
    const [initialPositionCost, setInitialPositionCost] = useState({})
    const [adjustedPositionCost, setAdjustedPositionCost] = useState({})
    const [tickerPrice, setTickerPrice] = useState({}) // from binance

    const [adjustedActualPositionQuantity, setAdjustedActualPositionQuantity] = useState({})
    const [portfolioMarketCap, setPortfolioMarketCap] = useState({}) // adjustedActualPositionQuantity * tickerPrice
    const [portfolioMarketCapRatio, setPortfolioMarketCapRatio] = useState({}) // portfolioMarketCap / sum(portfolioMarketCap)
    const [totalMarketCap, setTotalMarketCap] = useState(0)

    const [strategicAllocationRatio, setStrategicAllocationRatio] = useState({})
    const [strategicAllocationAmount, setStrategicAllocationAmount] = useState({}) // sum(portfolioMarketCap) * totalPositionRatio * strategicAllocationRatio
    const [strategicAllocation, setStrategicAllocation] = useState({}) // strategicAllocationAmount / tickerPrice
    const [strategicAllocationAdjustment, setStrategicAllocationAdjustment] = useState({}) // strategicAllocation - adjustedActualPositionQuantity

    const [tacticalAllocationRatio, setTacticalAllocationRatio] = useState({})
    const [tacticalAllocationAmount, setTacticalAllocationAmount] = useState({}) // sum(portfolioMarketCap) * totalPositionRatio * tacticalAllocationRatio
    const [tacticalAllocation, setTacticalAllocation] = useState({}) // tacticalAllocationAmount / tickerPrice
    const [tacticalAllocationRealized, setTacticalAllocationRealized] = useState({}) // later use let result = eval(str);

    const [liquidityRatio, setLiquidityRatio] = useState({})
    const [liquidityAmount, setLiquidityAmount] = useState({}) // sum(portfolioMarketCap) * totalPositionRatio * liquidityRatio

    const [dataGridRows, setDataGridRows] = useState([])

    const dataGridColumns = [
        {
            field: 'id',
            headerName: 'Ticker',
            width: 120,
        },
        {
            field: 'totalPositionRatio',
            headerName: 'Total Position Ratio',
            width: 100,
            valueGetter: (params) => {
                const value = parseFloat(params.value) * 100;
                return `${value.toFixed(2)}%`;
            },
        },
        {
            field: 'initialPositionCost',
            headerName: 'Initial Position Cost',
            width: 150,
            valueGetter: (params) => {
                return `$ ${params.value}`;
            },
        },
        {
            field: 'adjustedPositionCost',
            headerName: 'Adjusted Position Cost',
            width: 150,
            valueGetter: (params) => {
                return `$ ${params.value}`;
            },
        },
        {
            field: 'tickerPrice',
            headerName: 'Ticker Price',
            width: 150,
            valueGetter: (params) => {
                return `$ ${params.value}`;
            },
        },
        {
            field: 'adjustedActualPositionQuantity',
            headerName: 'Actual Position Quantity',
            width: 150,
        },
        {
            field: 'portfolioMarketCap',
            headerName: 'Portfolio Market Cap',
            width: 200,
            valueGetter: (params) => {
                return `$ ${params.value}`;
            },
        },
        {
            field: 'portfolioMarketCapRatio',
            headerName: 'Portfolio Market Cap Ratio',
            width: 100,
            valueGetter: (params) => {
                const value = parseFloat(params.value) * 100;
                return `${value.toFixed(2)}%`;
            },
        },
        {
            field: 'strategicAllocationRatio',
            headerName: 'Strategic Allocation Ratio',
            width: 100,
            valueGetter: (params) => {
                const value = parseFloat(params.value) * 100;
                return `${value.toFixed(2)}%`;
            },
        },
        {
            field: 'strategicAllocationAmount',
            headerName: 'Strategic Allocation Amount',
            width: 200,
            valueGetter: (params) => {
                return `$ ${params.value}`;
            },
        },
        {
            field: 'strategicAllocation',
            headerName: 'Strategic Allocation',
            width: 150,
        },
        {
            field: 'strategicAllocationAdjustment',
            headerName: 'Strategic Allocation Adjustment',
            width: 150,
        },
        {
            field: 'tacticalAllocationRatio',
            headerName: 'Tactical Allocation Ratio',
            width: 100,
            valueGetter: (params) => {
                const value = parseFloat(params.value) * 100;
                return `${value.toFixed(2)}%`;
            },
        },
        {
            field: 'tacticalAllocationAmount',
            headerName: 'Tactical Allocation Amount',
            width: 200,
            valueGetter: (params) => {
                return `$ ${params.value}`;
            },
        },
        {
            field: 'tacticalAllocation',
            headerName: 'Tactical Allocation',
            width: 150,
        },
        {
            field: 'tacticalAllocationRealized',
            headerName: 'Tactical Allocation Realized',
            width: 200,
            valueGetter: (params) => {
                return `$ ${eval(params.value)} derived from: ${params.value}`;
            },
            isEditable: true,
        },
        {
            field: 'liquidityRatio',
            headerName: 'Liquidity Ratio',
            width: 100,
            valueGetter: (params) => {
                const value = parseFloat(params.value) * 100;
                return `${value.toFixed(2)}%`;
            },
        },
        {
            field: 'liquidityAmount',
            headerName: 'Liquidity Amount',
            width: 200,
            valueGetter: (params) => {
                return `$ ${params.value}`;
            },
        },
    ];
    

    const handleFileRead = (e) => {
        const content = e.target.result;
        importState(content)
        setTimeout(() => {
            buttonRef.current.click();
        }, 1000);
        setTimeout(() => {
            buttonRef.current.click();
        }, 3000);
    };
    
    const handleFileChosen = (file) => {
        let fileReader = new FileReader();
        fileReader.onloadend = handleFileRead;
        fileReader.readAsText(file);
        fileInput.current.value = null;  // Clear the file input
    };

    // Function to trigger the file input's click event
    const handleButtonClick = () => {
        fileInput.current.click();
    };

    // handleGenerateSecretKey generates a 256 bit hash key
    const handleGenerateSecretKey = () => {
        let randomKey = CryptoJS.lib.WordArray.random(128/8); // Generate a 128-bit key
        let hashKey = CryptoJS.SHA256(randomKey).toString(); // Hash the key
        setSecretKey(hashKey)
    }

    // Function to trigger calculations
    const handleGenerate = async () => {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price')
        const responseData = await response.json();
        // Sort data by symbol
        responseData.sort((a, b) => a.symbol.localeCompare(b.symbol));
        setBinanceTickers(responseData)
        let temp = {}
        responseData.map((eachTicker) => {
            temp[eachTicker.symbol] = eachTicker.price
        })
        setTickerPrice(temp)

        let totalPortfolioMarketCap = 0;

        selectedBinanceTickers.map((ticker, index) => {
            let portfolioTickerMarketCap = adjustedActualPositionQuantity[ticker] * tickerPrice[ticker];
            let newPortfolioMarketCap = JSON.parse(JSON.stringify(portfolioMarketCap));
            newPortfolioMarketCap[ticker] = portfolioTickerMarketCap;
            setPortfolioMarketCap(newPortfolioMarketCap);
            // sum portfolioTickerMarketCap
            totalPortfolioMarketCap += portfolioTickerMarketCap;
        })

        setTotalMarketCap(totalPortfolioMarketCap + parseFloat(usdtLiquidityShortPosition));
        totalPortfolioMarketCap += usdtLiquidityShortPosition;

        // 
        let liquidity_short_positions = parseFloat(usdtLiquidityShortPosition) / (totalPortfolioMarketCap + parseFloat(usdtLiquidityShortPosition));
        let non_liquidity_short_positions = 1 - liquidity_short_positions;
        setLiquidityPosition({
            non_liquidity_short_positions: non_liquidity_short_positions,
            liquid_short_positions: liquidity_short_positions
        })

        let tempDataGridRows = [];
        let tempPieChartRows = [];
        
        let newPortfolioMarketCapRatio = JSON.parse(JSON.stringify(portfolioMarketCapRatio));
        let newStrategicAllocationAmount = JSON.parse(JSON.stringify(strategicAllocationAmount));
        let newStrategicAllocation = JSON.parse(JSON.stringify(strategicAllocation));
        let newStrategicAllocationAdjustment = JSON.parse(JSON.stringify(strategicAllocationAdjustment));
        let newTacticalAllocationAmount = JSON.parse(JSON.stringify(tacticalAllocationAmount));
        let newTacticalAllocation = JSON.parse(JSON.stringify(tacticalAllocation));
        let newLiquidityAmount = JSON.parse(JSON.stringify(liquidityAmount));

        selectedBinanceTickers.map((ticker, index) => {
            // Set portfolio market cap ratio
            let targetMarketCap = parseFloat(adjustedActualPositionQuantity[ticker]) * parseFloat(tickerPrice[ticker]);
            newPortfolioMarketCapRatio[ticker] = targetMarketCap / totalPortfolioMarketCap;

            // setStrategicAllocationAmount
            newStrategicAllocationAmount[ticker] = totalPortfolioMarketCap * parseFloat(totalPositionRatio[ticker]) * parseFloat(strategicAllocationRatio[ticker]);

            // setStrategicAllocation
            newStrategicAllocation[ticker] = newStrategicAllocationAmount[ticker] / tickerPrice[ticker];

            // setStrategicAllocationAdjustment
            newStrategicAllocationAdjustment[ticker] = newStrategicAllocation[ticker] - adjustedActualPositionQuantity[ticker];

            // setTacticalAllocationAmount
            newTacticalAllocationAmount[ticker] = totalPortfolioMarketCap * totalPositionRatio[ticker] * tacticalAllocationRatio[ticker];

            // setTacticalAllocation
            newTacticalAllocation[ticker] = newTacticalAllocationAmount[ticker] / tickerPrice[ticker];

            // setTacticalAllocationRealized just use eval

            // setLiquidityAmount
            newLiquidityAmount[ticker] = totalPortfolioMarketCap * totalPositionRatio[ticker] * liquidityRatio[ticker]
            
            let tempTicker = {
                id: ticker,
                totalPositionRatio: totalPositionRatio[ticker],
                initialPositionCost: initialPositionCost[ticker],
                adjustedPositionCost: adjustedPositionCost[ticker],
                tickerPrice: tickerPrice[ticker],
                adjustedActualPositionQuantity: adjustedActualPositionQuantity[ticker],
                portfolioMarketCap: adjustedActualPositionQuantity[ticker] * tickerPrice[ticker],
                portfolioMarketCapRatio: newPortfolioMarketCapRatio[ticker],
                strategicAllocationRatio: strategicAllocationRatio[ticker],
                strategicAllocationAmount: strategicAllocationAmount[ticker],
                strategicAllocation: strategicAllocation[ticker],
                strategicAllocationAdjustment: strategicAllocationAdjustment[ticker],
                tacticalAllocationRatio: tacticalAllocationRatio[ticker],
                tacticalAllocationAmount: tacticalAllocationAmount[ticker],
                tacticalAllocation: tacticalAllocation[ticker],
                tacticalAllocationRealized: tacticalAllocationRealized[ticker],
                liquidityRatio: liquidityRatio[ticker],
                liquidityAmount: liquidityAmount[ticker],
            }
            
            let tempPieChartData = { value: totalPositionRatio[ticker] * 100, name: ticker}

            tempDataGridRows.push(tempTicker)
            tempPieChartRows.push(tempPieChartData)
        })
        setPortfolioMarketCapRatio(newPortfolioMarketCapRatio);
        setStrategicAllocationAmount(newStrategicAllocationAmount);
        setStrategicAllocation(newStrategicAllocation);
        setStrategicAllocationAdjustment(newStrategicAllocationAdjustment);
        setTacticalAllocationAmount(newTacticalAllocationAmount);
        setTacticalAllocation(newTacticalAllocation);
        setLiquidityAmount(newLiquidityAmount);

        console.log(tempDataGridRows);

        setDataGridRows(tempDataGridRows);

        var option = {
            backgroundColor: '#343541',
            legend: {
              show: false
            },
            toolbox: {
              show: true,
              feature: {
                mark: { show: true },
                dataView: { show: true, readOnly: false },
                restore: { show: true },
                saveAsImage: { show: true }
              }
            },
            series: [
              {
                name: 'Position Chart',
                type: 'pie',
                radius: [50, 250],
                center: ['50%', '50%'],
                roseType: 'area',
                itemStyle: {
                  borderRadius: 8
                },
                label: {
                    color: '#fff'
                },
                data: tempPieChartRows
              }
            ]
        };
        
        setPieChartOptions(option);
    };

    useEffect(() => {
        fetch('https://api.binance.com/api/v3/ticker/price')
        .then(response => response.json())
        .then(data => {
            // Sort data by symbol
            data.sort((a, b) => a.symbol.localeCompare(b.symbol));
            setBinanceTickers(data)
            let temp = {}
            data.map((eachTicker) => {
                temp[eachTicker.symbol] = eachTicker.price
            })
            setTickerPrice(temp)
        })
        .catch(error => console.error('Error:', error));
    }, []);

    const handleTickerSelect = (event) => {
        setSelectedBinanceTickers(event.target.value);
    };

    const handleExportState = () => {
        const stateAsString = JSON.stringify({
            selectedBinanceTickers: selectedBinanceTickers,
            initialPrincipal: initialPrincipal,
            additionalSubscription: additionalSubscription,
            additionalRedemption: additionalRedemption,
            usdtLiquidityShortPosition: usdtLiquidityShortPosition,
            totalPositionRatio: totalPositionRatio,
            initialPositionCost: initialPositionCost,
            adjustedPositionCost: adjustedPositionCost,
            adjustedActualPositionQuantity: adjustedActualPositionQuantity,
            strategicAllocationRatio: strategicAllocationRatio,
            tacticalAllocationRatio: tacticalAllocationRatio,
            tacticalAllocationRealized: tacticalAllocationRealized,
            liquidityRatio: liquidityRatio,
        });
        const encryptedState = CryptoJS.AES.encrypt(stateAsString, secretKey).toString();
        // Now you can use encryptedState string to export your state.
        console.log(encryptedState);

        // Create a Blob with the encrypted data
        let blob = new Blob([encryptedState], {type: "text/plain;charset=utf-8"});

        // Create a hidden download link and append it to the body
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "ORC_encryptedState.txt";  // Name of the downloaded file
        link.style.display = "none";
        document.body.appendChild(link);

        // Programmatically click the download link
        link.click();

        // Remove the link when done
        document.body.removeChild(link);
    }

    const importState = (encryptedState) => {
        const bytes  = CryptoJS.AES.decrypt(encryptedState, secretKey);
        const originalState = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        console.log("originalState: \n", originalState);
        // Now you can use originalState object to import your state.
        setInitialPrincipal(originalState.initialPrincipal);
        setAdditionalSubscription(originalState.additionalSubscription);
        setAdditionalRedemption(originalState.additionalRedemption);
        setUsdtLiquidityShortPosition(originalState.usdtLiquidityShortPosition);
        setTotalPositionRatio(originalState.totalPositionRatio);
        setInitialPositionCost(originalState.initialPositionCost);
        setAdjustedPositionCost(originalState.adjustedPositionCost);
        setAdjustedActualPositionQuantity(originalState.adjustedActualPositionQuantity);
        setStrategicAllocationRatio(originalState.strategicAllocationRatio);
        setTacticalAllocationRatio(originalState.tacticalAllocationRatio);
        setTacticalAllocationRealized(originalState.tacticalAllocationRealized);
        setLiquidityRatio(originalState.liquidityRatio);

        setSelectedBinanceTickers(originalState.selectedBinanceTickers);
    }

  return (
    <div className={styles.portfolio}>
        <input type='file'
            id='file'
            ref={fileInput}
            onChange={e => handleFileChosen(e.target.files[0])}
            style={{ display: 'none'}} // hide default file input
        />
        <Button variant="contained" onClick={handleButtonClick}>
            Upload ORC File
        </Button>&nbsp;
        <Button variant="contained" onClick={handleExportState}>
            Export ORC File
        </Button>&nbsp;
        <Button variant="contained" onClick={handleGenerateSecretKey}>
            Generate Secret Key
        </Button>
        <br/><br/>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <StyledTextField
                    fullWidth
                    id="secret-key"
                    label="Secret Key"
                    type="text"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={secretKey}
                    onChange={(event) => {
                        setSecretKey(event.target.value);
                    }}
                />
            </Grid>
        </Grid>
        <br/><br/>
        <FormControl fullWidth>
            <InputLabel id="mutiple-name-label">Tickers</InputLabel>
            <StyledSelect
                labelId="mutiple-name-label"
                id="mutiple-name"
                multiple
                label="Tickers"
                value={selectedBinanceTickers}
                onChange={handleTickerSelect}
                fullWidth
            >
                {binanceTickers.map((ticker) => (
                <MenuItem key={ticker.symbol} value={ticker.symbol}>
                    {ticker.symbol}
                </MenuItem>
                ))}
            </StyledSelect>
        </FormControl>
        <br/><br/>
        <CustomAccordion className={styles.accordian}>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <Typography>Input Parameters</Typography>
            </AccordionSummary>
            <AccordionDetails>
            <FormControl fullWidth>
                <Grid container spacing={3}>
                    <Grid item xs={3}>
                        <StyledTextField
                            fullWidth
                            id="outlined-initial-principal"
                            label="Initial Principal"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={initialPrincipal}
                            onChange={(event) => {
                                setInitialPrincipal(event.target.value);
                            }}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <StyledTextField
                            fullWidth
                            id="outlined-additional-subscription"
                            label="Additional Subscription"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={additionalSubscription}
                            onChange={(event) => {
                                setAdditionalSubscription(event.target.value);
                            }}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <StyledTextField
                            fullWidth
                            id="outlined-additional-redemption"
                            label="Additional Redemption"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={additionalRedemption}
                            onChange={(event) => {
                                setAdditionalRedemption(event.target.value);
                            }}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <StyledTextField
                            fullWidth
                            id="outlined-USDT-liquidity-short-position"
                            label="USDT Liquidity Short Position"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={usdtLiquidityShortPosition}
                            onChange={(event) => {
                                setUsdtLiquidityShortPosition(event.target.value);
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography>Cryptocurrencies:</Typography>
                    </Grid>
                </Grid>
                    {selectedBinanceTickers.map((ticker, index) => (
                    <Grid container spacing={3} key={ticker} style={{ marginTop: '1em' }}>
                        <Divider style={{ backgroundColor: 'white', height: 1 }} />
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant='h4'>{ticker}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledTextField
                                fullWidth
                                id={`totalPositionRatio-${index}`}
                                label="Total Position Ratio"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                value={totalPositionRatio[ticker]}
                                onChange={(event) => {
                                    const newTotalPositionRatio = JSON.parse(JSON.stringify(totalPositionRatio));
                                    newTotalPositionRatio[ticker] = event.target.value;
                                    setTotalPositionRatio(newTotalPositionRatio);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledTextField
                                fullWidth
                                id={`initialPositionCost-${index}`}
                                label="Initial Position Cost"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                value={initialPositionCost[ticker]}
                                onChange={(event) => {
                                    const newInitialPositionCost = JSON.parse(JSON.stringify(initialPositionCost));
                                    newInitialPositionCost[ticker] = event.target.value;
                                    setInitialPositionCost(newInitialPositionCost);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledTextField
                                fullWidth
                                id={`adjustedPositionCost-${index}`}
                                label="Adjusted Position Cost"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                value={adjustedPositionCost[ticker]}
                                onChange={(event) => {
                                    const newAdjustedPositionCost = JSON.parse(JSON.stringify(adjustedPositionCost));
                                    newAdjustedPositionCost[ticker] = event.target.value;
                                    setAdjustedPositionCost(newAdjustedPositionCost);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledTextField
                                fullWidth
                                id={`adjustedActualPositionQuantity-${index}`}
                                label="Actual Position Quantity"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                value={adjustedActualPositionQuantity[ticker]}
                                onChange={(event) => {
                                    const newAdjustedActualPositionQuantity = JSON.parse(JSON.stringify(adjustedActualPositionQuantity));
                                    newAdjustedActualPositionQuantity[ticker] = event.target.value;
                                    setAdjustedActualPositionQuantity(newAdjustedActualPositionQuantity);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledTextField
                                fullWidth
                                id={`strategicAllocationRatio-${index}`}
                                label="Strategic Allocation Ratio"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                value={strategicAllocationRatio[ticker]}
                                onChange={(event) => {
                                    const newStrategicAllocationRatio = JSON.parse(JSON.stringify(strategicAllocationRatio));
                                    newStrategicAllocationRatio[ticker] = event.target.value;
                                    setStrategicAllocationRatio(newStrategicAllocationRatio);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledTextField
                                fullWidth
                                id={`tacticalAllocationRatio-${index}`}
                                label="Tactical Allocation Ratio"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                value={tacticalAllocationRatio[ticker]}
                                onChange={(event) => {
                                    const newTacticalAllocationRatio = JSON.parse(JSON.stringify(tacticalAllocationRatio));
                                    newTacticalAllocationRatio[ticker] = event.target.value;
                                    setTacticalAllocationRatio(newTacticalAllocationRatio);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledTextField
                                fullWidth
                                id={`tacticalAllocationRealized-${index}`}
                                label="Tactical Allocation Realized"
                                type="text"
                                InputLabelProps={{ shrink: true }}
                                value={tacticalAllocationRealized[ticker]}
                                onChange={(event) => {
                                    const newTacticalAllocationRealized = JSON.parse(JSON.stringify(tacticalAllocationRealized));
                                    newTacticalAllocationRealized[ticker] = event.target.value;
                                    setTacticalAllocationRealized(newTacticalAllocationRealized);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StyledTextField
                                fullWidth
                                id={`liquidityRatio-${index}`}
                                label="Liquidity Ratio"
                                type="number"
                                InputLabelProps={{ shrink: true }}
                                value={liquidityRatio[ticker]}
                                onChange={(event) => {
                                    const newLiquidityRatio = JSON.parse(JSON.stringify(liquidityRatio));
                                    newLiquidityRatio[ticker] = event.target.value;
                                    setLiquidityRatio(newLiquidityRatio);
                                }}
                            />
                        </Grid>
                    </Grid>))}
            </FormControl>
            <br/><br/>
            <Button ref={buttonRef} fullWidth variant="contained" onClick={handleGenerate}>Generate</Button>
            </AccordionDetails>
        </CustomAccordion>
        <br/><br/>
        <Grid container spacing={3}>
        {
            <Grid item xs={3}>
                <Typography>{`Initial Principal: $ ${initialPrincipal || 0}`}</Typography>
            </Grid>
        }
        {
            additionalSubscription && <Grid item xs={3}>
                <Typography>{`Additional Subscription: $ ${additionalSubscription || 0}`}</Typography>
            </Grid>
        }
        {
            additionalRedemption && <Grid item xs={3}>
                <Typography>{`Additional Redemption: $ ${additionalRedemption || 0}`}</Typography>
            </Grid>
        }
        {
            <Grid item xs={3}>
                <Typography>{`Account Principal: $ ${parseFloat(initialPrincipal) + parseFloat(additionalSubscription) + parseFloat(additionalRedemption)}`}</Typography>
            </Grid>
        }
        {
            <Grid item xs={3}>
                <Typography>{`USDT Liquidity Short Position: $ ${usdtLiquidityShortPosition}`}</Typography>
            </Grid>
        }
        {
            <Grid item xs={3}>
                <Typography>{`Liquidity Short Position Ratio: ${(parseFloat((liquidityPosition && liquidityPosition.liquid_short_positions) || 0) * 100).toFixed(2)}%`}</Typography>
            </Grid>
        }
        {
            <Grid item xs={3}>
                <Typography>{`Non Liquidity Short Position Ratio: ${(parseFloat((liquidityPosition && liquidityPosition.non_liquidity_short_positions) || 0) * 100).toFixed(2)}%`}</Typography>
            </Grid>
        }
        {
            <Grid item xs={3}>
                <Typography>{`Total Portfolio MarketCap: $ ${parseFloat((totalMarketCap) || 0)}`}</Typography>
            </Grid>
        }
        </Grid>
        <br/><br/>
        {
            dataGridRows && dataGridRows.length && <Box sx={{ height: 500, width: '100%' }}>
            <StyledDataGrid
                density={'compact'}
                style={{backgroundColor: 'white'}}
                rows={dataGridRows}
                columns={dataGridColumns}
                initialState={{
                }}
                pageSizeOptions={[100]}
                paginationMode={'client'}
            />
        </Box>
        }
        <br/><br/>
        {
            dataGridRows && dataGridRows.length && <ReactEcharts
            option={pieChartOptions}
            style={{ minWidth: "600px", minHeight: "560px" }}
          ></ReactEcharts>
        }
    </div>
  );
}