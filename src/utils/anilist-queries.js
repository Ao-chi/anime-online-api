export const anilistTrendingMangaQuery = `query ($page: Int, $perPage: Int, $type: MediaType, $countryOfOrigin: CountryCode) {
         Page(page: $page, perPage: $perPage) {
            pageInfo {
                total
                perPage
                currentPage
                lastPage
                hasNextPage
            }
            media(sort: TRENDING_DESC, type: $type , countryOfOrigin:$countryOfOrigin) {
                id
                idMal
                title {
                  romaji
                  english
                  native
                  userPreferred
                }
                coverImage {
                  large
                  color
                }
                bannerImage   
                chapters
                status
                averageScore
                meanScore
                format
                description 
                season
                seasonYear
                startDate {
                    year
                    month
                    day
                }
                endDate {
                    year
                    month
                    day
                }
                genres
                synonyms
                
              
            }
        }
    }
    `;
export const anilistMangaQuery = `query ($page: Int, $perPage: Int, $type: MediaType, $countryOfOrigin: CountryCode, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
           pageInfo {
               total
               perPage
               currentPage
               lastPage
               hasNextPage
           }
           media(sort: $sort, type: $type , countryOfOrigin:$countryOfOrigin) {
               id
               idMal
               title {
                 romaji
                 english
                 native
                 userPreferred
               }
               coverImage {
                 large
                 color
               }
               bannerImage   
               chapters
               status
               averageScore
               meanScore
               format
               description 
               season
               seasonYear
               startDate {
                   year
                   month
                   day
               }
               endDate {
                   year
                   month
                   day
               }
               genres
               synonyms
               
             
           }
       }
   }
   `;

export const anilistMediaTitlesQuery = `query($id: Int) {
   Media(id: $id) {
    title {
        romaji
        english
        native
        userPreferred
    }
   }}`;
