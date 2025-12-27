/**
 * Service to fetch drug images and labels from FDA APIs
 */

export interface DrugImage {
  url: string;
  name: string;
  ndc?: string;
  rxcui?: string;
}

export interface DrugLabelInfo {
  setId: string;
  title: string;
  labelerName: string;
  imageUrl?: string;
  labelUrl: string;
}

/**
 * Fetch pill images from RxImage API (NIH)
 * https://rximage.nlm.nih.gov/docs/doku.php?id=start
 */
export async function getPillImages(drugName: string, ndc?: string): Promise<DrugImage[]> {
  try {
    // Try searching by name first
    const searchParam = ndc ? `ndc=${ndc}` : `name=${encodeURIComponent(drugName)}`;
    const response = await fetch(
      `https://rximage.nlm.nih.gov/api/rximage/1/rxbase?${searchParam}&resolution=600`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (data.nlmRxImages && data.nlmRxImages.length > 0) {
      return data.nlmRxImages.slice(0, 6).map((img: Record<string, string>) => ({
        url: img.imageUrl,
        name: img.name || drugName,
        ndc: img.ndc11,
        rxcui: img.rxcui,
      }));
    }

    return [];
  } catch (error) {
    console.error('RxImage API error:', error);
    return [];
  }
}

/**
 * Fetch drug label information from DailyMed API
 * https://dailymed.nlm.nih.gov/dailymed/webservices-help/v2/spls_api.cfm
 */
export async function getDrugLabel(drugName: string): Promise<DrugLabelInfo | null> {
  try {
    // Search for the drug in DailyMed
    const searchResponse = await fetch(
      `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encodeURIComponent(drugName)}&pagesize=1`
    );

    if (!searchResponse.ok) return null;

    const searchData = await searchResponse.json();

    if (!searchData.data || searchData.data.length === 0) return null;

    const spl = searchData.data[0];
    const setId = spl.setid;

    // Get label image if available
    let imageUrl: string | undefined;
    try {
      const mediaResponse = await fetch(
        `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setId}/media.json`
      );
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json();
        if (mediaData.data && mediaData.data.length > 0) {
          // Find product image (label or packaging)
          const labelMedia = mediaData.data.find((m: Record<string, string>) =>
            m.name?.toLowerCase().includes('label') ||
            m.name?.toLowerCase().includes('package') ||
            m.mime_type?.includes('image')
          );
          if (labelMedia) {
            imageUrl = `https://dailymed.nlm.nih.gov/dailymed/image.cfm?setid=${setId}&name=${labelMedia.name}`;
          }
        }
      }
    } catch {
      // Media fetch failed, continue without image
    }

    return {
      setId,
      title: spl.title || drugName,
      labelerName: spl.labeler || 'Unknown',
      imageUrl,
      labelUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setId}`,
    };
  } catch (error) {
    console.error('DailyMed API error:', error);
    return null;
  }
}

/**
 * Get OpenFDA drug label PDF link
 */
export function getOpenFDALabelUrl(drugName: string): string {
  return `https://labels.fda.gov/search?q=${encodeURIComponent(drugName)}`;
}

/**
 * Get DailyMed search URL for a drug
 */
export function getDailyMedSearchUrl(drugName: string): string {
  return `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(drugName)}`;
}
