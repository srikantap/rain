Here's an attempt to discover rainfall data of all districts across India, spread over 100 years (1901 - 2001). The data was derived from www.indiawaterportal.org/met_data database.

The source data is spread across two CSVs. The code reads them, joins them together, and 'melts' a few columns to make the data easy to process. This results in a huge database (~ 7 lakh entries!).

Crossfilter is used to slice and dice data. DC.js helps in visualizing it.

NOTE: Pl note, however, that the datasets of districts are of varying size. https://en.wikipedia.org/wiki/Bayesian_probability#Bayesian_average is yet to be calculated.

Comments and suggestions are welcome! :-)
