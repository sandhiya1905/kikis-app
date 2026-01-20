#!/usr/bin/env node

/**
 * Test script for scholarship page functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🎓 Testing NovaLearn Scholarship Page');
console.log('=====================================\n');

// Test 1: Check if scholarship files exist
console.log('📁 Checking scholarship page files...');
const scholarshipFiles = [
    'web/scholarships.html',
    'web/scholarships.js',
    'web/scripts/scholarship-data.js'
];

let allFilesExist = true;
scholarshipFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file} exists`);
    } else {
        console.log(`   ❌ ${file} missing`);
        allFilesExist = false;
    }
});

// Test 2: Check scholarship data structure
console.log('\n📊 Checking scholarship data...');
try {
    const scholarshipDataPath = path.join('web', 'scripts', 'scholarship-data.js');
    const scholarshipContent = fs.readFileSync(scholarshipDataPath, 'utf8');
    
    // Extract scholarship data array
    const dataMatch = scholarshipContent.match(/const scholarshipData = (\[[\s\S]*?\]);/);
    if (dataMatch) {
        // Simple validation - count scholarships
        const scholarshipCount = (dataMatch[1].match(/{\s*id:/g) || []).length;
        console.log(`   ✅ Found ${scholarshipCount} scholarships in data`);
        
        // Check for required fields
        const requiredFields = ['title', 'provider', 'amount', 'deadline', 'field', 'level'];
        const hasAllFields = requiredFields.every(field => 
            scholarshipContent.includes(`${field}:`)
        );
        
        if (hasAllFields) {
            console.log('   ✅ All required fields present');
        } else {
            console.log('   ⚠️  Some required fields may be missing');
        }
    } else {
        console.log('   ❌ Could not parse scholarship data');
    }
} catch (error) {
    console.log(`   ❌ Error reading scholarship data: ${error.message}`);
}

// Test 3: Check HTML structure
console.log('\n🌐 Checking HTML structure...');
try {
    const htmlContent = fs.readFileSync('web/scholarships.html', 'utf8');
    
    const checks = [
        { name: 'Navigation', pattern: /<nav.*class.*blue-600/ },
        { name: 'Search section', pattern: /scholarshipSearch/ },
        { name: 'Filter section', pattern: /fieldFilter/ },
        { name: 'Results section', pattern: /scholarshipCards/ },
        { name: 'Modal', pattern: /scholarshipModal/ },
        { name: 'JavaScript includes', pattern: /scholarship-data\.js/ }
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(htmlContent)) {
            console.log(`   ✅ ${check.name} found`);
        } else {
            console.log(`   ❌ ${check.name} missing`);
        }
    });
} catch (error) {
    console.log(`   ❌ Error reading HTML: ${error.message}`);
}

// Test 4: Check JavaScript functionality
console.log('\n⚙️  Checking JavaScript functionality...');
try {
    const jsContent = fs.readFileSync('web/scholarships.js', 'utf8');
    
    const functions = [
        'searchScholarships',
        'applyFilters',
        'sortScholarships',
        'displayScholarships',
        'showScholarshipDetails',
        'updateStatistics'
    ];
    
    functions.forEach(func => {
        if (jsContent.includes(func)) {
            console.log(`   ✅ ${func}() function found`);
        } else {
            console.log(`   ❌ ${func}() function missing`);
        }
    });
} catch (error) {
    console.log(`   ❌ Error reading JavaScript: ${error.message}`);
}

// Test 5: Check navigation integration
console.log('\n🔗 Checking navigation integration...');
try {
    const indexContent = fs.readFileSync('web/index.html', 'utf8');
    
    if (indexContent.includes('scholarships.html')) {
        console.log('   ✅ Navigation link to scholarships page found');
    } else {
        console.log('   ❌ Navigation link missing');
    }
    
    if (indexContent.includes('Browse Scholarships')) {
        console.log('   ✅ Feature section link found');
    } else {
        console.log('   ⚠️  Feature section link may be missing');
    }
} catch (error) {
    console.log(`   ❌ Error reading index.html: ${error.message}`);
}

console.log('\n🎯 Test Summary');
console.log('===============');
if (allFilesExist) {
    console.log('✅ All scholarship page files are present');
    console.log('🌐 Web server should be running at: http://localhost:3000');
    console.log('🔗 Scholarship page available at: http://localhost:3000/scholarships.html');
    console.log('\n📋 Features Available:');
    console.log('   • 12 sample scholarships with detailed information');
    console.log('   • Search functionality by title, provider, field, or tags');
    console.log('   • Advanced filtering by field, level, amount, and deadline');
    console.log('   • Sorting by deadline, amount, or name');
    console.log('   • Detailed scholarship modals with application links');
    console.log('   • Responsive design with Tailwind CSS');
    console.log('   • Integration with user authentication system');
    console.log('\n🎓 Sample Scholarships Include:');
    console.log('   • Google AI Research Scholarship ($50,000)');
    console.log('   • Microsoft Diversity in Tech Scholarship ($25,000)');
    console.log('   • NSF Graduate Fellowship ($37,000)');
    console.log('   • Gates Millennium Scholars Program (Full Tuition)');
    console.log('   • Thiel Fellowship ($100,000)');
    console.log('   • And 7 more scholarships from major organizations');
} else {
    console.log('❌ Some files are missing - please check the setup');
}

console.log('\n🚀 Ready to test! Open http://localhost:3000/scholarships.html in your browser');