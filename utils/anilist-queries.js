export const anilistTrendingMangaQuery = `query ($page: Int, $perPage: Int, $type: MediaType) {
         Page(page: $page, perPage: $perPage) {
            pageInfo {
                total
                perPage
                currentPage
                lastPage
                hasNextPage
            }
            media(sort: TRENDING_DESC, type: $type) {
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
