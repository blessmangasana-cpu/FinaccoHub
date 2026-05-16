# Connect to Supabase from R for analytics

library(httr)
library(jsonlite)

supabase_url <- Sys.getenv('SUPABASE_URL')
supabase_key <- Sys.getenv('SUPABASE_KEY')

get_equities <- function() {
  res <- GET(
    url = paste0(supabase_url, '/rest/v1/rse_equities'),
    add_headers(
      apikey = supabase_key,
      Authorization = paste('Bearer', supabase_key)
    ),
    query = list(select = '*', limit = 100)
  )
  fromJSON(content(res, 'text', encoding = 'UTF-8'))
}

if (interactive()) {
  print(get_equities())
}
