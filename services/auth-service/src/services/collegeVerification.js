const { logger } = require('../utils/logger');

/**
 * College verification service
 * In a production environment, this would integrate with actual college databases
 * or third-party verification services
 */
class CollegeVerificationService {
  constructor() {
    // Mock database of verified colleges
    this.verifiedColleges = new Set([
      'harvard university',
      'stanford university',
      'massachusetts institute of technology',
      'california institute of technology',
      'university of california berkeley',
      'university of california los angeles',
      'princeton university',
      'yale university',
      'columbia university',
      'university of chicago',
      'cornell university',
      'university of pennsylvania',
      'johns hopkins university',
      'northwestern university',
      'duke university',
      'vanderbilt university',
      'rice university',
      'washington university in st louis',
      'emory university',
      'georgetown university',
      'carnegie mellon university',
      'university of southern california',
      'university of virginia',
      'wake forest university',
      'university of michigan ann arbor',
      'university of north carolina chapel hill',
      'boston college',
      'new york university',
      'university of rochester',
      'brandeis university',
      'case western reserve university',
      'georgia institute of technology',
      'university of wisconsin madison',
      'university of illinois urbana champaign',
      'boston university',
      'tulane university',
      'northeastern university',
      'rensselaer polytechnic institute',
      'university of miami',
      'university of texas austin',
      'university of washington',
      'university of florida',
      'ohio state university',
      'pennsylvania state university',
      'university of georgia',
      'purdue university',
      'university of minnesota',
      'texas a&m university',
      'virginia tech',
      'clemson university',
      'university of pittsburgh',
      'michigan state university',
      'university of maryland college park',
      'indiana university bloomington',
      'university of iowa',
      'university of colorado boulder',
      'arizona state university',
      'university of arizona',
      'university of utah',
      'university of oregon',
      'university of california san diego',
      'university of california irvine',
      'university of california davis',
      'university of california santa barbara'
    ]);

    // Mock email domains for college verification
    this.collegeEmailDomains = new Map([
      ['harvard.edu', 'Harvard University'],
      ['stanford.edu', 'Stanford University'],
      ['mit.edu', 'Massachusetts Institute of Technology'],
      ['caltech.edu', 'California Institute of Technology'],
      ['berkeley.edu', 'University of California Berkeley'],
      ['ucla.edu', 'University of California Los Angeles'],
      ['princeton.edu', 'Princeton University'],
      ['yale.edu', 'Yale University'],
      ['columbia.edu', 'Columbia University'],
      ['uchicago.edu', 'University of Chicago'],
      ['cornell.edu', 'Cornell University'],
      ['upenn.edu', 'University of Pennsylvania'],
      ['jhu.edu', 'Johns Hopkins University'],
      ['northwestern.edu', 'Northwestern University'],
      ['duke.edu', 'Duke University'],
      ['vanderbilt.edu', 'Vanderbilt University'],
      ['rice.edu', 'Rice University'],
      ['wustl.edu', 'Washington University in St Louis'],
      ['emory.edu', 'Emory University'],
      ['georgetown.edu', 'Georgetown University'],
      ['cmu.edu', 'Carnegie Mellon University'],
      ['usc.edu', 'University of Southern California'],
      ['virginia.edu', 'University of Virginia'],
      ['wfu.edu', 'Wake Forest University'],
      ['umich.edu', 'University of Michigan Ann Arbor'],
      ['unc.edu', 'University of North Carolina Chapel Hill'],
      ['bc.edu', 'Boston College'],
      ['nyu.edu', 'New York University'],
      ['rochester.edu', 'University of Rochester'],
      ['brandeis.edu', 'Brandeis University'],
      ['case.edu', 'Case Western Reserve University'],
      ['gatech.edu', 'Georgia Institute of Technology'],
      ['wisc.edu', 'University of Wisconsin Madison'],
      ['illinois.edu', 'University of Illinois Urbana Champaign'],
      ['bu.edu', 'Boston University'],
      ['tulane.edu', 'Tulane University'],
      ['northeastern.edu', 'Northeastern University'],
      ['rpi.edu', 'Rensselaer Polytechnic Institute'],
      ['miami.edu', 'University of Miami'],
      ['utexas.edu', 'University of Texas Austin'],
      ['washington.edu', 'University of Washington'],
      ['ufl.edu', 'University of Florida'],
      ['osu.edu', 'Ohio State University'],
      ['psu.edu', 'Pennsylvania State University'],
      ['uga.edu', 'University of Georgia'],
      ['purdue.edu', 'Purdue University'],
      ['umn.edu', 'University of Minnesota'],
      ['tamu.edu', 'Texas A&M University'],
      ['vt.edu', 'Virginia Tech'],
      ['clemson.edu', 'Clemson University'],
      ['pitt.edu', 'University of Pittsburgh'],
      ['msu.edu', 'Michigan State University'],
      ['umd.edu', 'University of Maryland College Park'],
      ['indiana.edu', 'Indiana University Bloomington'],
      ['uiowa.edu', 'University of Iowa'],
      ['colorado.edu', 'University of Colorado Boulder'],
      ['asu.edu', 'Arizona State University'],
      ['arizona.edu', 'University of Arizona'],
      ['utah.edu', 'University of Utah'],
      ['uoregon.edu', 'University of Oregon'],
      ['ucsd.edu', 'University of California San Diego'],
      ['uci.edu', 'University of California Irvine'],
      ['ucdavis.edu', 'University of California Davis'],
      ['ucsb.edu', 'University of California Santa Barbara']
    ]);
  }

  /**
   * Verify if a college name is legitimate
   * @param {string} collegeName - Name of the college to verify
   * @returns {Object} Verification result
   */
  async verifyCollege(collegeName) {
    try {
      const normalizedName = collegeName.toLowerCase().trim();
      
      // Check against verified colleges list
      const isVerified = this.verifiedColleges.has(normalizedName);
      
      // In production, this would make API calls to college databases
      // For now, we'll simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = {
        isVerified,
        collegeName: collegeName,
        normalizedName: normalizedName,
        verificationMethod: 'database_lookup',
        confidence: isVerified ? 0.95 : 0.1
      };

      logger.info('College verification completed', {
        collegeName,
        isVerified,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      logger.error('College verification failed', {
        collegeName,
        error: error.message
      });
      
      return {
        isVerified: false,
        collegeName,
        error: 'Verification service unavailable',
        confidence: 0
      };
    }
  }

  /**
   * Verify college email domain
   * @param {string} email - Email address to verify
   * @returns {Object} Email verification result
   */
  async verifyCollegeEmail(email) {
    try {
      const emailDomain = email.split('@')[1]?.toLowerCase();
      
      if (!emailDomain) {
        return {
          isVerified: false,
          email,
          error: 'Invalid email format'
        };
      }

      const collegeName = this.collegeEmailDomains.get(emailDomain);
      const isVerified = !!collegeName;

      const result = {
        isVerified,
        email,
        domain: emailDomain,
        collegeName: collegeName || null,
        verificationMethod: 'email_domain',
        confidence: isVerified ? 0.9 : 0
      };

      logger.info('Email domain verification completed', {
        email,
        domain: emailDomain,
        isVerified,
        collegeName
      });

      return result;
    } catch (error) {
      logger.error('Email verification failed', {
        email,
        error: error.message
      });
      
      return {
        isVerified: false,
        email,
        error: 'Email verification service unavailable'
      };
    }
  }

  /**
   * Get suggestions for similar college names
   * @param {string} collegeName - Partial or incorrect college name
   * @returns {Array} Array of suggested college names
   */
  getSuggestions(collegeName) {
    const normalizedInput = collegeName.toLowerCase().trim();
    const suggestions = [];

    for (const college of this.verifiedColleges) {
      if (college.includes(normalizedInput) || normalizedInput.includes(college)) {
        suggestions.push(college);
      }
    }

    // Limit to top 5 suggestions
    return suggestions.slice(0, 5).map(name => 
      name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    );
  }

  /**
   * Comprehensive verification combining multiple methods
   * @param {string} email - User's email
   * @param {string} collegeName - College name from profile
   * @returns {Object} Comprehensive verification result
   */
  async comprehensiveVerification(email, collegeName) {
    try {
      const [emailVerification, collegeVerification] = await Promise.all([
        this.verifyCollegeEmail(email),
        this.verifyCollege(collegeName)
      ]);

      // Calculate overall confidence
      let overallConfidence = 0;
      let verificationMethods = [];

      if (emailVerification.isVerified) {
        overallConfidence += 0.6; // Email verification carries more weight
        verificationMethods.push('email_domain');
      }

      if (collegeVerification.isVerified) {
        overallConfidence += 0.4;
        verificationMethods.push('college_database');
      }

      // Check if email and college match
      const emailCollegeName = emailVerification.collegeName?.toLowerCase();
      const profileCollegeName = collegeName.toLowerCase();
      const collegesMatch = emailCollegeName && 
        (emailCollegeName.includes(profileCollegeName) || 
         profileCollegeName.includes(emailCollegeName));

      if (collegesMatch) {
        overallConfidence += 0.2; // Bonus for matching
      }

      const result = {
        isVerified: overallConfidence >= 0.5,
        overallConfidence: Math.min(overallConfidence, 1.0),
        verificationMethods,
        emailVerification,
        collegeVerification,
        collegesMatch,
        suggestions: collegeVerification.isVerified ? [] : this.getSuggestions(collegeName)
      };

      logger.info('Comprehensive verification completed', {
        email,
        collegeName,
        isVerified: result.isVerified,
        confidence: result.overallConfidence,
        methods: verificationMethods
      });

      return result;
    } catch (error) {
      logger.error('Comprehensive verification failed', {
        email,
        collegeName,
        error: error.message
      });

      return {
        isVerified: false,
        error: 'Verification service unavailable',
        overallConfidence: 0,
        suggestions: this.getSuggestions(collegeName)
      };
    }
  }
}

module.exports = new CollegeVerificationService();