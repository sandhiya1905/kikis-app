const axios = require('axios');

class APITester {
  constructor() {
    this.baseUrls = {
      auth: 'http://localhost:3001',
      content: 'http://localhost:3002'
    };
    this.authToken = null;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testHealthChecks() {
    console.log('🏥 Testing health checks...');
    
    try {
      const authHealth = await axios.get(`${this.baseUrls.auth}/health`);
      console.log('   ✅ Auth Service health:', authHealth.data.status);
    } catch (error) {
      console.log('   ❌ Auth Service health check failed');
      return false;
    }

    try {
      const contentHealth = await axios.get(`${this.baseUrls.content}/health`);
      console.log('   ✅ Content Service health:', contentHealth.data.status);
    } catch (error) {
      console.log('   ❌ Content Service health check failed');
      return false;
    }

    return true;
  }

  async testAuthentication() {
    console.log('🔐 Testing authentication...');
    
    try {
      // Test login with sample user
      const loginResponse = await axios.post(`${this.baseUrls.auth}/api/auth/login`, {
        email: 'john.doe@harvard.edu',
        password: 'SecurePass123'
      });

      if (loginResponse.data.success) {
        this.authToken = loginResponse.data.data.accessToken;
        console.log('   ✅ Login successful');
        console.log(`   👤 User: ${loginResponse.data.data.user.profile.name}`);
        return true;
      } else {
        console.log('   ❌ Login failed');
        return false;
      }
    } catch (error) {
      console.log('   ❌ Authentication test failed:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testContentSearch() {
    console.log('🔍 Testing content search...');
    
    try {
      const searchResponse = await axios.get(`${this.baseUrls.content}/api/search`, {
        params: { q: 'computer', limit: 3 }
      });

      if (searchResponse.data.success) {
        console.log(`   ✅ Search successful - found ${searchResponse.data.data.materials.length} materials`);
        searchResponse.data.data.materials.forEach(material => {
          console.log(`      📚 ${material.title} (${material.subject})`);
        });
        return true;
      } else {
        console.log('   ❌ Search failed');
        return false;
      }
    } catch (error) {
      console.log('   ❌ Search test failed:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testContentRetrieval() {
    console.log('📚 Testing content retrieval...');
    
    try {
      const materialsResponse = await axios.get(`${this.baseUrls.content}/api/content/materials`, {
        params: { limit: 5 }
      });

      if (materialsResponse.data.success) {
        console.log(`   ✅ Retrieved ${materialsResponse.data.data.materials.length} materials`);
        materialsResponse.data.data.materials.forEach(material => {
          console.log(`      📖 ${material.title} - ${material.rating.average}⭐ (${material.access_count} views)`);
        });
        return true;
      } else {
        console.log('   ❌ Content retrieval failed');
        return false;
      }
    } catch (error) {
      console.log('   ❌ Content retrieval test failed:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testSubjects() {
    console.log('📋 Testing subjects endpoint...');
    
    try {
      const subjectsResponse = await axios.get(`${this.baseUrls.content}/api/content/subjects`);

      if (subjectsResponse.data.success) {
        console.log(`   ✅ Found ${subjectsResponse.data.data.subjects.length} subjects`);
        subjectsResponse.data.data.subjects.forEach(subject => {
          console.log(`      📚 ${subject.subject} (${subject.count} materials)`);
        });
        return true;
      } else {
        console.log('   ❌ Subjects test failed');
        return false;
      }
    } catch (error) {
      console.log('   ❌ Subjects test failed:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testUserProfile() {
    console.log('👤 Testing user profile...');
    
    if (!this.authToken) {
      console.log('   ❌ No auth token available');
      return false;
    }

    try {
      const profileResponse = await axios.get(`${this.baseUrls.auth}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`
        }
      });

      if (profileResponse.data.success) {
        const user = profileResponse.data.data.user;
        console.log(`   ✅ Profile retrieved for ${user.profile.name}`);
        console.log(`      🎓 ${user.profile.college} - ${user.profile.major}`);
        console.log(`      📧 ${user.email} (${user.is_verified ? 'Verified' : 'Not verified'})`);
        return true;
      } else {
        console.log('   ❌ Profile test failed');
        return false;
      }
    } catch (error) {
      console.log('   ❌ Profile test failed:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 NovaLearn API Testing Suite');
    console.log('==============================\n');

    const tests = [
      { name: 'Health Checks', fn: () => this.testHealthChecks() },
      { name: 'Authentication', fn: () => this.testAuthentication() },
      { name: 'User Profile', fn: () => this.testUserProfile() },
      { name: 'Content Search', fn: () => this.testContentSearch() },
      { name: 'Content Retrieval', fn: () => this.testContentRetrieval() },
      { name: 'Subjects', fn: () => this.testSubjects() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test.fn();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.log(`   ❌ ${test.name} test crashed:`, error.message);
        failed++;
      }
      console.log(''); // Add spacing between tests
    }

    console.log('📊 Test Results:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! NovaLearn Platform is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the services and try again.');
    }

    return failed === 0;
  }
}

// Wait for services to start, then run tests
async function runTests() {
  console.log('⏳ Waiting for services to start...');
  await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

  const tester = new APITester();
  await tester.runAllTests();
}

if (require.main === module) {
  runTests();
}

module.exports = APITester;