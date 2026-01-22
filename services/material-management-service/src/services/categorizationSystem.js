const mongoose = require('mongoose');

/**
 * Hierarchical Categorization and Tagging System
 * Manages sophisticated categorization with multi-dimensional tagging,
 * semantic relationships, and dynamic categorization based on usage patterns
 */
class CategorizationSystem {
  constructor() {
    this.categoryTree = this.initializeCategoryTree();
    this.tagRelationships = this.initializeTagRelationships();
    this.semanticConnections = this.initializeSemanticConnections();
    this.dynamicCategories = new Map();
  }

  /**
   * Initialize the complete category tree structure
   */
  initializeCategoryTree() {
    return {
      'STEM': {
        id: 'stem',
        description: 'Science, Technology, Engineering, and Mathematics',
        subcategories: {
          'Mathematics': {
            id: 'mathematics',
            description: 'Mathematical sciences and applications',
            subcategories: {
              'Pure Mathematics': {
                id: 'pure_math',
                topics: {
                  'Algebra': {
                    id: 'algebra',
                    subtopics: ['Linear Algebra', 'Abstract Algebra', 'Boolean Algebra', 'Group Theory', 'Ring Theory']
                  },
                  'Analysis': {
                    id: 'analysis',
                    subtopics: ['Real Analysis', 'Complex Analysis', 'Functional Analysis', 'Harmonic Analysis']
                  },
                  'Geometry': {
                    id: 'geometry',
                    subtopics: ['Euclidean Geometry', 'Non-Euclidean Geometry', 'Differential Geometry', 'Topology']
                  },
                  'Number Theory': {
                    id: 'number_theory',
                    subtopics: ['Elementary Number Theory', 'Algebraic Number Theory', 'Analytic Number Theory']
                  }
                }
              },
              'Applied Mathematics': {
                id: 'applied_math',
                topics: {
                  'Calculus': {
                    id: 'calculus',
                    subtopics: ['Differential Calculus', 'Integral Calculus', 'Multivariable Calculus', 'Vector Calculus']
                  },
                  'Statistics': {
                    id: 'statistics',
                    subtopics: ['Descriptive Statistics', 'Inferential Statistics', 'Bayesian Statistics', 'Non-parametric Statistics']
                  },
                  'Probability': {
                    id: 'probability',
                    subtopics: ['Probability Theory', 'Stochastic Processes', 'Markov Chains', 'Random Variables']
                  },
                  'Optimization': {
                    id: 'optimization',
                    subtopics: ['Linear Programming', 'Nonlinear Optimization', 'Convex Optimization', 'Integer Programming']
                  }
                }
              }
            }
          },
          'Computer Science': {
            id: 'computer_science',
            description: 'Computing theory, systems, and applications',
            subcategories: {
              'Theoretical Computer Science': {
                id: 'theoretical_cs',
                topics: {
                  'Algorithms': {
                    id: 'algorithms',
                    subtopics: ['Sorting Algorithms', 'Graph Algorithms', 'Dynamic Programming', 'Greedy Algorithms']
                  },
                  'Data Structures': {
                    id: 'data_structures',
                    subtopics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Hash Tables', 'Heaps']
                  },
                  'Complexity Theory': {
                    id: 'complexity_theory',
                    subtopics: ['Time Complexity', 'Space Complexity', 'NP-Completeness', 'Approximation Algorithms']
                  },
                  'Formal Methods': {
                    id: 'formal_methods',
                    subtopics: ['Logic', 'Automata Theory', 'Model Checking', 'Program Verification']
                  }
                }
              },
              'Applied Computer Science': {
                id: 'applied_cs',
                topics: {
                  'Programming': {
                    id: 'programming',
                    subtopics: ['Web Development', 'Mobile Development', 'Desktop Applications', 'Game Development']
                  },
                  'Software Engineering': {
                    id: 'software_engineering',
                    subtopics: ['Design Patterns', 'Testing', 'Architecture', 'DevOps', 'Agile Methodologies']
                  },
                  'Artificial Intelligence': {
                    id: 'artificial_intelligence',
                    subtopics: ['Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision']
                  },
                  'Systems': {
                    id: 'systems',
                    subtopics: ['Operating Systems', 'Database Systems', 'Distributed Systems', 'Network Systems']
                  }
                }
              }
            }
          },
          'Physics': {
            id: 'physics',
            description: 'Physical sciences and natural phenomena',
            subcategories: {
              'Classical Physics': {
                id: 'classical_physics',
                topics: {
                  'Mechanics': {
                    id: 'mechanics',
                    subtopics: ['Classical Mechanics', 'Fluid Mechanics', 'Continuum Mechanics', 'Celestial Mechanics']
                  },
                  'Thermodynamics': {
                    id: 'thermodynamics',
                    subtopics: ['Classical Thermodynamics', 'Statistical Mechanics', 'Kinetic Theory']
                  },
                  'Electromagnetism': {
                    id: 'electromagnetism',
                    subtopics: ['Electrostatics', 'Magnetostatics', 'Electromagnetic Waves', 'Maxwell Equations']
                  }
                }
              },
              'Modern Physics': {
                id: 'modern_physics',
                topics: {
                  'Quantum Mechanics': {
                    id: 'quantum_mechanics',
                    subtopics: ['Wave Mechanics', 'Matrix Mechanics', 'Quantum Field Theory', 'Quantum Information']
                  },
                  'Relativity': {
                    id: 'relativity',
                    subtopics: ['Special Relativity', 'General Relativity', 'Cosmology', 'Black Holes']
                  },
                  'Particle Physics': {
                    id: 'particle_physics',
                    subtopics: ['Standard Model', 'Elementary Particles', 'Particle Accelerators', 'High Energy Physics']
                  }
                }
              }
            }
          },
          'Engineering': {
            id: 'engineering',
            description: 'Applied sciences and engineering disciplines',
            subcategories: {
              'Electrical Engineering': {
                id: 'electrical_engineering',
                topics: {
                  'Circuit Analysis': {
                    id: 'circuit_analysis',
                    subtopics: ['DC Circuits', 'AC Circuits', 'Digital Circuits', 'Analog Circuits']
                  },
                  'Signal Processing': {
                    id: 'signal_processing',
                    subtopics: ['Digital Signal Processing', 'Image Processing', 'Audio Processing', 'Filter Design']
                  },
                  'Power Systems': {
                    id: 'power_systems',
                    subtopics: ['Power Generation', 'Power Transmission', 'Power Distribution', 'Renewable Energy']
                  }
                }
              },
              'Mechanical Engineering': {
                id: 'mechanical_engineering',
                topics: {
                  'Solid Mechanics': {
                    id: 'solid_mechanics',
                    subtopics: ['Statics', 'Dynamics', 'Strength of Materials', 'Finite Element Analysis']
                  },
                  'Heat Transfer': {
                    id: 'heat_transfer',
                    subtopics: ['Conduction', 'Convection', 'Radiation', 'Heat Exchangers']
                  },
                  'Manufacturing': {
                    id: 'manufacturing',
                    subtopics: ['Machining', '3D Printing', 'Quality Control', 'Automation']
                  }
                }
              }
            }
          }
        }
      },
      'Liberal Arts': {
        id: 'liberal_arts',
        description: 'Humanities and social sciences',
        subcategories: {
          'Literature': {
            id: 'literature',
            description: 'Literary works and analysis',
            subcategories: {
              'Fiction': {
                id: 'fiction',
                topics: {
                  'Novels': {
                    id: 'novels',
                    subtopics: ['Classic Literature', 'Modern Fiction', 'Science Fiction', 'Fantasy', 'Mystery']
                  },
                  'Short Stories': {
                    id: 'short_stories',
                    subtopics: ['Contemporary Short Fiction', 'Classic Short Stories', 'Flash Fiction']
                  },
                  'Poetry': {
                    id: 'poetry',
                    subtopics: ['Classical Poetry', 'Modern Poetry', 'Free Verse', 'Sonnets', 'Haiku']
                  }
                }
              },
              'Non-Fiction': {
                id: 'non_fiction',
                topics: {
                  'Essays': {
                    id: 'essays',
                    subtopics: ['Personal Essays', 'Academic Essays', 'Critical Essays', 'Narrative Essays']
                  },
                  'Biographies': {
                    id: 'biographies',
                    subtopics: ['Historical Biographies', 'Contemporary Biographies', 'Autobiographies', 'Memoirs']
                  },
                  'Historical Texts': {
                    id: 'historical_texts',
                    subtopics: ['Primary Sources', 'Historical Analysis', 'Cultural History', 'Social History']
                  }
                }
              }
            }
          },
          'Philosophy': {
            id: 'philosophy',
            description: 'Philosophical inquiry and thought',
            subcategories: {
              'Ethics': {
                id: 'ethics',
                topics: {
                  'Normative Ethics': {
                    id: 'normative_ethics',
                    subtopics: ['Deontology', 'Consequentialism', 'Virtue Ethics', 'Care Ethics']
                  },
                  'Applied Ethics': {
                    id: 'applied_ethics',
                    subtopics: ['Medical Ethics', 'Business Ethics', 'Environmental Ethics', 'Computer Ethics']
                  },
                  'Meta-Ethics': {
                    id: 'meta_ethics',
                    subtopics: ['Moral Realism', 'Moral Anti-Realism', 'Moral Psychology', 'Moral Epistemology']
                  }
                }
              },
              'Logic': {
                id: 'logic',
                topics: {
                  'Formal Logic': {
                    id: 'formal_logic',
                    subtopics: ['Propositional Logic', 'Predicate Logic', 'Modal Logic', 'Temporal Logic']
                  },
                  'Informal Logic': {
                    id: 'informal_logic',
                    subtopics: ['Argumentation Theory', 'Fallacies', 'Critical Thinking', 'Rhetoric']
                  }
                }
              }
            }
          },
          'History': {
            id: 'history',
            description: 'Historical studies and analysis',
            subcategories: {
              'Ancient History': {
                id: 'ancient_history',
                topics: {
                  'Classical Antiquity': {
                    id: 'classical_antiquity',
                    subtopics: ['Ancient Greece', 'Ancient Rome', 'Ancient Egypt', 'Ancient Mesopotamia']
                  },
                  'Medieval Period': {
                    id: 'medieval_period',
                    subtopics: ['Early Middle Ages', 'High Middle Ages', 'Late Middle Ages', 'Byzantine Empire']
                  }
                }
              },
              'Modern History': {
                id: 'modern_history',
                topics: {
                  'Renaissance': {
                    id: 'renaissance',
                    subtopics: ['Italian Renaissance', 'Northern Renaissance', 'Renaissance Art', 'Renaissance Science']
                  },
                  'Industrial Revolution': {
                    id: 'industrial_revolution',
                    subtopics: ['First Industrial Revolution', 'Second Industrial Revolution', 'Social Changes', 'Technological Innovation']
                  },
                  'Contemporary History': {
                    id: 'contemporary_history',
                    subtopics: ['20th Century', '21st Century', 'World Wars', 'Cold War', 'Globalization']
                  }
                }
              }
            }
          }
        }
      },
      'Business': {
        id: 'business',
        description: 'Business administration and economics',
        subcategories: {
          'Management': {
            id: 'management',
            description: 'Organizational management and leadership',
            subcategories: {
              'Strategic Management': {
                id: 'strategic_management',
                topics: {
                  'Leadership': {
                    id: 'leadership',
                    subtopics: ['Team Leadership', 'Organizational Leadership', 'Change Leadership', 'Transformational Leadership']
                  },
                  'Strategic Planning': {
                    id: 'strategic_planning',
                    subtopics: ['Business Strategy', 'Competitive Analysis', 'Market Positioning', 'Strategic Implementation']
                  }
                }
              },
              'Operations Management': {
                id: 'operations_management',
                topics: {
                  'Project Management': {
                    id: 'project_management',
                    subtopics: ['Agile Project Management', 'Waterfall Methodology', 'Risk Management', 'Resource Planning']
                  },
                  'Quality Management': {
                    id: 'quality_management',
                    subtopics: ['Six Sigma', 'Total Quality Management', 'ISO Standards', 'Continuous Improvement']
                  },
                  'Supply Chain': {
                    id: 'supply_chain',
                    subtopics: ['Logistics', 'Procurement', 'Inventory Management', 'Distribution']
                  }
                }
              }
            }
          },
          'Finance': {
            id: 'finance',
            description: 'Financial management and economics',
            subcategories: {
              'Corporate Finance': {
                id: 'corporate_finance',
                topics: {
                  'Financial Analysis': {
                    id: 'financial_analysis',
                    subtopics: ['Financial Statements', 'Ratio Analysis', 'Cash Flow Analysis', 'Valuation']
                  },
                  'Investment': {
                    id: 'investment',
                    subtopics: ['Portfolio Management', 'Asset Allocation', 'Risk Assessment', 'Capital Markets']
                  }
                }
              },
              'Economics': {
                id: 'economics',
                topics: {
                  'Microeconomics': {
                    id: 'microeconomics',
                    subtopics: ['Supply and Demand', 'Market Structures', 'Consumer Theory', 'Producer Theory']
                  },
                  'Macroeconomics': {
                    id: 'macroeconomics',
                    subtopics: ['GDP', 'Inflation', 'Unemployment', 'Monetary Policy', 'Fiscal Policy']
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Initialize tag relationships and synonyms
   */
  initializeTagRelationships() {
    return {
      synonyms: {
        'programming': ['coding', 'software_development', 'development'],
        'mathematics': ['math', 'maths', 'mathematical'],
        'artificial_intelligence': ['ai', 'machine_intelligence', 'ai_ml'],
        'machine_learning': ['ml', 'statistical_learning', 'predictive_modeling'],
        'data_science': ['data_analysis', 'analytics', 'big_data'],
        'web_development': ['web_dev', 'frontend', 'backend', 'fullstack'],
        'database': ['db', 'data_storage', 'sql', 'nosql'],
        'algorithms': ['algo', 'algorithmic', 'computational_methods'],
        'statistics': ['stats', 'statistical_analysis', 'statistical_methods'],
        'calculus': ['differential_calculus', 'integral_calculus', 'calc'],
        'physics': ['physical_science', 'natural_philosophy'],
        'chemistry': ['chemical_science', 'chem'],
        'biology': ['biological_science', 'life_science', 'bio'],
        'literature': ['literary_studies', 'lit', 'literary_analysis'],
        'history': ['historical_studies', 'hist', 'historical_analysis'],
        'philosophy': ['philosophical_studies', 'phil', 'philosophical_inquiry'],
        'business': ['business_studies', 'commerce', 'business_administration'],
        'economics': ['economic_studies', 'econ', 'economic_analysis'],
        'management': ['business_management', 'organizational_management', 'mgmt'],
        'finance': ['financial_studies', 'financial_management', 'fin']
      },
      related: {
        'programming': ['algorithms', 'data_structures', 'software_engineering', 'computer_science'],
        'machine_learning': ['artificial_intelligence', 'statistics', 'data_science', 'mathematics'],
        'calculus': ['mathematics', 'physics', 'engineering', 'analysis'],
        'statistics': ['mathematics', 'data_science', 'probability', 'research_methods'],
        'algorithms': ['computer_science', 'mathematics', 'programming', 'complexity_theory'],
        'physics': ['mathematics', 'engineering', 'chemistry', 'astronomy'],
        'chemistry': ['physics', 'biology', 'materials_science', 'biochemistry'],
        'biology': ['chemistry', 'medicine', 'genetics', 'ecology'],
        'literature': ['writing', 'language', 'cultural_studies', 'history'],
        'history': ['literature', 'political_science', 'sociology', 'anthropology'],
        'philosophy': ['logic', 'ethics', 'religion', 'psychology'],
        'economics': ['business', 'finance', 'mathematics', 'statistics'],
        'business': ['economics', 'management', 'finance', 'marketing'],
        'management': ['business', 'leadership', 'psychology', 'organizational_behavior']
      },
      hierarchical: {
        'computer_science': ['programming', 'algorithms', 'data_structures', 'software_engineering'],
        'mathematics': ['calculus', 'algebra', 'statistics', 'geometry', 'analysis'],
        'physics': ['mechanics', 'thermodynamics', 'electromagnetism', 'quantum_mechanics'],
        'engineering': ['electrical_engineering', 'mechanical_engineering', 'civil_engineering'],
        'literature': ['fiction', 'poetry', 'drama', 'literary_criticism'],
        'business': ['management', 'finance', 'marketing', 'operations']
      }
    };
  }

  /**
   * Initialize semantic connections between concepts
   */
  initializeSemanticConnections() {
    return {
      conceptual_relationships: {
        'prerequisite': {
          'calculus': ['algebra', 'trigonometry'],
          'machine_learning': ['statistics', 'linear_algebra', 'programming'],
          'quantum_mechanics': ['linear_algebra', 'calculus', 'classical_mechanics'],
          'data_structures': ['programming_basics', 'discrete_mathematics'],
          'algorithms': ['data_structures', 'mathematics', 'programming'],
          'software_engineering': ['programming', 'data_structures', 'algorithms'],
          'financial_analysis': ['accounting', 'statistics', 'economics'],
          'organic_chemistry': ['general_chemistry', 'chemical_bonding'],
          'differential_equations': ['calculus', 'linear_algebra'],
          'computer_graphics': ['linear_algebra', 'programming', 'geometry']
        },
        'application': {
          'statistics': ['data_science', 'research', 'quality_control', 'finance'],
          'calculus': ['physics', 'engineering', 'economics', 'optimization'],
          'linear_algebra': ['machine_learning', 'computer_graphics', 'quantum_mechanics'],
          'algorithms': ['software_development', 'data_processing', 'optimization'],
          'probability': ['statistics', 'machine_learning', 'finance', 'physics'],
          'logic': ['computer_science', 'mathematics', 'philosophy', 'linguistics'],
          'ethics': ['medicine', 'business', 'technology', 'law'],
          'psychology': ['education', 'marketing', 'human_resources', 'therapy']
        },
        'methodology': {
          'experimental_design': ['psychology', 'biology', 'chemistry', 'physics'],
          'proof_techniques': ['mathematics', 'computer_science', 'logic'],
          'case_study': ['business', 'medicine', 'law', 'social_sciences'],
          'historical_analysis': ['history', 'literature', 'political_science'],
          'statistical_analysis': ['research', 'data_science', 'economics'],
          'literary_criticism': ['literature', 'cultural_studies', 'philosophy']
        }
      },
      difficulty_progression: {
        'mathematics': [
          'arithmetic', 'algebra', 'geometry', 'trigonometry', 'calculus', 
          'linear_algebra', 'differential_equations', 'real_analysis', 'abstract_algebra'
        ],
        'programming': [
          'basic_syntax', 'control_structures', 'functions', 'data_structures',
          'algorithms', 'object_oriented_programming', 'design_patterns', 'software_architecture'
        ],
        'physics': [
          'kinematics', 'dynamics', 'energy', 'waves', 'thermodynamics',
          'electromagnetism', 'modern_physics', 'quantum_mechanics', 'field_theory'
        ],
        'chemistry': [
          'atomic_structure', 'chemical_bonding', 'stoichiometry', 'thermochemistry',
          'kinetics', 'equilibrium', 'organic_chemistry', 'physical_chemistry'
        ]
      }
    };
  }

  /**
   * Categorize material based on metadata and content analysis
   * @param {Object} metadata - Material metadata
   * @param {Object} contentAnalysis - Results from content analysis
   * @returns {Object} Categorization results
   */
  async categorize(metadata, contentAnalysis = {}) {
    try {
      const categorization = {
        primary_category: null,
        secondary_categories: [],
        category_path: [],
        hierarchical_tags: [],
        semantic_tags: [],
        difficulty_level_tags: [],
        relationship_tags: [],
        confidence_scores: {},
        suggestions: []
      };

      // Find primary category
      const primaryCategory = await this.findPrimaryCategory(metadata, contentAnalysis);
      if (primaryCategory) {
        categorization.primary_category = primaryCategory.category;
        categorization.category_path = primaryCategory.path;
        categorization.confidence_scores.primary = primaryCategory.confidence;
      }

      // Find secondary categories
      const secondaryCategories = await this.findSecondaryCategories(metadata, contentAnalysis);
      categorization.secondary_categories = secondaryCategories.map(cat => cat.category);
      categorization.confidence_scores.secondary = secondaryCategories.map(cat => cat.confidence);

      // Generate hierarchical tags
      categorization.hierarchical_tags = await this.generateHierarchicalTags(
        categorization.category_path,
        metadata.topics || [],
        metadata.tags || []
      );

      // Generate semantic tags
      categorization.semantic_tags = await this.generateSemanticTags(
        metadata,
        contentAnalysis
      );

      // Generate difficulty-based tags
      categorization.difficulty_level_tags = await this.generateDifficultyTags(
        metadata.difficulty_level,
        metadata.subject,
        contentAnalysis
      );

      // Generate relationship tags
      categorization.relationship_tags = await this.generateRelationshipTags(
        metadata,
        categorization.hierarchical_tags
      );

      // Generate suggestions for improvement
      categorization.suggestions = await this.generateCategorizationSuggestions(
        metadata,
        categorization
      );

      // Update dynamic categories based on usage patterns
      await this.updateDynamicCategories(categorization, metadata);

      return {
        success: true,
        categorization,
        metadata_enhanced: await this.enhanceMetadataWithCategorization(metadata, categorization)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        categorization: null
      };
    }
  }

  /**
   * Find the primary category for the material
   */
  async findPrimaryCategory(metadata, contentAnalysis) {
    const candidates = [];

    // Check subject-based categorization
    if (metadata.subject) {
      const subjectCategory = this.findCategoryBySubject(metadata.subject);
      if (subjectCategory) {
        candidates.push({
          category: subjectCategory.category,
          path: subjectCategory.path,
          confidence: 0.9,
          source: 'subject'
        });
      }
    }

    // Check topic-based categorization
    if (metadata.topics && metadata.topics.length > 0) {
      for (const topic of metadata.topics) {
        const topicCategory = this.findCategoryByTopic(topic);
        if (topicCategory) {
          candidates.push({
            category: topicCategory.category,
            path: topicCategory.path,
            confidence: 0.7,
            source: 'topic'
          });
        }
      }
    }

    // Check content-based categorization
    if (contentAnalysis.detectedTopics) {
      for (const topic of contentAnalysis.detectedTopics) {
        const contentCategory = this.findCategoryByTopic(topic);
        if (contentCategory) {
          candidates.push({
            category: contentCategory.category,
            path: contentCategory.path,
            confidence: 0.6,
            source: 'content'
          });
        }
      }
    }

    // Return the highest confidence candidate
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.confidence - a.confidence);
      return candidates[0];
    }

    return null;
  }

  /**
   * Find secondary categories for the material
   */
  async findSecondaryCategories(metadata, contentAnalysis) {
    const categories = [];
    const primarySubject = metadata.subject;

    // Find related subjects
    const relatedSubjects = this.tagRelationships.related[primarySubject] || [];
    for (const relatedSubject of relatedSubjects) {
      const category = this.findCategoryBySubject(relatedSubject);
      if (category) {
        categories.push({
          category: category.category,
          path: category.path,
          confidence: 0.5,
          source: 'related_subject'
        });
      }
    }

    // Find categories from tags
    if (metadata.tags) {
      for (const tag of metadata.tags) {
        const category = this.findCategoryByTag(tag);
        if (category) {
          categories.push({
            category: category.category,
            path: category.path,
            confidence: 0.4,
            source: 'tag'
          });
        }
      }
    }

    // Find categories from learning objectives
    if (metadata.learning_objectives) {
      for (const objective of metadata.learning_objectives) {
        const detectedTopics = await this.extractTopicsFromText(objective);
        for (const topic of detectedTopics) {
          const category = this.findCategoryByTopic(topic);
          if (category) {
            categories.push({
              category: category.category,
              path: category.path,
              confidence: 0.3,
              source: 'learning_objective'
            });
          }
        }
      }
    }

    // Remove duplicates and sort by confidence
    const uniqueCategories = this.removeDuplicateCategories(categories);
    return uniqueCategories.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  /**
   * Generate hierarchical tags based on category structure
   */
  async generateHierarchicalTags(categoryPath, topics, existingTags) {
    const hierarchicalTags = new Set();

    // Add category path tags
    if (categoryPath && categoryPath.length > 0) {
      for (let i = 0; i < categoryPath.length; i++) {
        const pathTag = categoryPath.slice(0, i + 1).join('/').toLowerCase().replace(/\s+/g, '_');
        hierarchicalTags.add(pathTag);
      }
    }

    // Add topic hierarchy tags
    for (const topic of topics) {
      const topicHierarchy = this.findTopicHierarchy(topic);
      if (topicHierarchy) {
        for (const hierarchyTag of topicHierarchy) {
          hierarchicalTags.add(hierarchyTag.toLowerCase().replace(/\s+/g, '_'));
        }
      }
    }

    // Add hierarchical relationships for existing tags
    for (const tag of existingTags) {
      const hierarchicalRelations = this.tagRelationships.hierarchical[tag] || [];
      for (const relation of hierarchicalRelations) {
        hierarchicalTags.add(relation.toLowerCase().replace(/\s+/g, '_'));
      }
    }

    return Array.from(hierarchicalTags);
  }

  /**
   * Generate semantic tags based on relationships and context
   */
  async generateSemanticTags(metadata, contentAnalysis) {
    const semanticTags = new Set();

    // Add synonym tags
    const allTags = [...(metadata.tags || []), ...(metadata.topics || [])];
    for (const tag of allTags) {
      const synonyms = this.tagRelationships.synonyms[tag] || [];
      for (const synonym of synonyms) {
        semanticTags.add(synonym);
      }
    }

    // Add related concept tags
    for (const tag of allTags) {
      const related = this.tagRelationships.related[tag] || [];
      for (const relatedTag of related) {
        semanticTags.add(relatedTag);
      }
    }

    // Add application domain tags
    if (metadata.subject) {
      const applications = this.semanticConnections.conceptual_relationships.application[metadata.subject] || [];
      for (const application of applications) {
        semanticTags.add(application);
      }
    }

    // Add methodology tags based on content type
    if (metadata.content_type) {
      const methodologies = this.getMethodologiesForContentType(metadata.content_type);
      for (const methodology of methodologies) {
        semanticTags.add(methodology);
      }
    }

    return Array.from(semanticTags);
  }

  /**
   * Generate difficulty-level specific tags
   */
  async generateDifficultyTags(difficultyLevel, subject, contentAnalysis) {
    const difficultyTags = [];

    // Add difficulty level tag
    difficultyTags.push(`difficulty_${difficultyLevel}`);

    // Add subject-specific difficulty progression tags
    if (subject && this.semanticConnections.difficulty_progression[subject]) {
      const progression = this.semanticConnections.difficulty_progression[subject];
      const difficultyIndex = this.getDifficultyIndex(difficultyLevel);
      
      // Add tags for concepts at this difficulty level
      if (difficultyIndex < progression.length) {
        difficultyTags.push(`${subject}_level_${difficultyIndex + 1}`);
        difficultyTags.push(progression[difficultyIndex]);
      }

      // Add prerequisite tags
      if (difficultyIndex > 0) {
        difficultyTags.push(`requires_${progression[difficultyIndex - 1]}`);
      }

      // Add next level tags
      if (difficultyIndex < progression.length - 1) {
        difficultyTags.push(`leads_to_${progression[difficultyIndex + 1]}`);
      }
    }

    // Add audience-specific tags
    const audienceTags = this.getAudienceTagsForDifficulty(difficultyLevel);
    difficultyTags.push(...audienceTags);

    return difficultyTags;
  }

  /**
   * Generate relationship tags based on prerequisites and connections
   */
  async generateRelationshipTags(metadata, hierarchicalTags) {
    const relationshipTags = [];

    // Add prerequisite relationship tags
    if (metadata.prerequisites && metadata.prerequisites.length > 0) {
      relationshipTags.push('has_prerequisites');
      relationshipTags.push(`prerequisite_count_${metadata.prerequisites.length}`);
    }

    // Add learning path tags
    if (metadata.learning_path_position) {
      relationshipTags.push('part_of_learning_path');
      relationshipTags.push(`path_position_${metadata.learning_path_position}`);
    }

    // Add interdisciplinary tags
    const disciplines = this.identifyDisciplines(hierarchicalTags);
    if (disciplines.length > 1) {
      relationshipTags.push('interdisciplinary');
      relationshipTags.push(`spans_${disciplines.length}_disciplines`);
      for (const discipline of disciplines) {
        relationshipTags.push(`connects_${discipline}`);
      }
    }

    // Add complexity relationship tags
    const complexityTags = this.generateComplexityRelationshipTags(metadata);
    relationshipTags.push(...complexityTags);

    return relationshipTags;
  }

  /**
   * Generate suggestions for improving categorization
   */
  async generateCategorizationSuggestions(metadata, categorization) {
    const suggestions = [];

    // Suggest missing categories
    if (!categorization.primary_category) {
      suggestions.push({
        type: 'missing_primary_category',
        message: 'Consider specifying a more specific subject to improve categorization',
        action: 'review_subject_field'
      });
    }

    // Suggest additional topics
    if (categorization.hierarchical_tags.length < 3) {
      suggestions.push({
        type: 'insufficient_topics',
        message: 'Adding more specific topics will improve content discoverability',
        action: 'add_topics',
        suggested_topics: this.suggestTopicsForCategory(categorization.primary_category)
      });
    }

    // Suggest related materials
    if (categorization.semantic_tags.length > 0) {
      const relatedMaterials = await this.findRelatedMaterials(categorization.semantic_tags);
      if (relatedMaterials.length > 0) {
        suggestions.push({
          type: 'related_materials',
          message: 'Consider linking to related materials to create learning paths',
          action: 'add_related_materials',
          suggested_materials: relatedMaterials.slice(0, 5)
        });
      }
    }

    // Suggest prerequisite materials
    if (metadata.difficulty_level !== 'beginner') {
      const prerequisites = this.suggestPrerequisites(metadata.subject, metadata.topics);
      if (prerequisites.length > 0) {
        suggestions.push({
          type: 'missing_prerequisites',
          message: 'Consider specifying prerequisite materials for better learning path integration',
          action: 'add_prerequisites',
          suggested_prerequisites: prerequisites
        });
      }
    }

    return suggestions;
  }

  /**
   * Update dynamic categories based on usage patterns
   */
  async updateDynamicCategories(categorization, metadata) {
    const categoryKey = categorization.primary_category;
    if (!categoryKey) return;

    // Update usage statistics
    if (!this.dynamicCategories.has(categoryKey)) {
      this.dynamicCategories.set(categoryKey, {
        usage_count: 0,
        common_tags: new Map(),
        difficulty_distribution: new Map(),
        content_types: new Map(),
        last_updated: new Date()
      });
    }

    const categoryStats = this.dynamicCategories.get(categoryKey);
    categoryStats.usage_count++;

    // Update common tags
    const allTags = [...(metadata.tags || []), ...categorization.hierarchical_tags];
    for (const tag of allTags) {
      categoryStats.common_tags.set(tag, (categoryStats.common_tags.get(tag) || 0) + 1);
    }

    // Update difficulty distribution
    if (metadata.difficulty_level) {
      categoryStats.difficulty_distribution.set(
        metadata.difficulty_level,
        (categoryStats.difficulty_distribution.get(metadata.difficulty_level) || 0) + 1
      );
    }

    // Update content types
    if (metadata.content_type) {
      categoryStats.content_types.set(
        metadata.content_type,
        (categoryStats.content_types.get(metadata.content_type) || 0) + 1
      );
    }

    categoryStats.last_updated = new Date();
  }

  /**
   * Enhance metadata with categorization information
   */
  async enhanceMetadataWithCategorization(metadata, categorization) {
    const enhanced = { ...metadata };

    // Add category information
    enhanced.primary_category = categorization.primary_category;
    enhanced.secondary_categories = categorization.secondary_categories;
    enhanced.category_path = categorization.category_path;

    // Merge tags
    const existingTags = new Set(enhanced.tags || []);
    const newTags = new Set([
      ...categorization.hierarchical_tags,
      ...categorization.semantic_tags,
      ...categorization.difficulty_level_tags,
      ...categorization.relationship_tags
    ]);

    enhanced.tags = Array.from(new Set([...existingTags, ...newTags]));

    // Add categorization metadata
    enhanced.categorization_metadata = {
      confidence_scores: categorization.confidence_scores,
      categorization_timestamp: new Date(),
      categorization_version: '1.0'
    };

    return enhanced;
  }

  // Helper methods
  findCategoryBySubject(subject) {
    return this.searchCategoryTree(this.categoryTree, 'subject', subject);
  }

  findCategoryByTopic(topic) {
    return this.searchCategoryTree(this.categoryTree, 'topic', topic);
  }

  findCategoryByTag(tag) {
    return this.searchCategoryTree(this.categoryTree, 'tag', tag);
  }

  searchCategoryTree(tree, searchType, searchValue) {
    const lowerSearchValue = searchValue.toLowerCase();
    
    for (const [categoryName, categoryData] of Object.entries(tree)) {
      if (typeof categoryData === 'object' && categoryData.subcategories) {
        // Check current level
        if (this.matchesSearchCriteria(categoryName, categoryData, searchType, lowerSearchValue)) {
          return {
            category: categoryName,
            path: [categoryName]
          };
        }
        
        // Search subcategories recursively
        const subResult = this.searchCategoryTree(categoryData.subcategories, searchType, searchValue);
        if (subResult) {
          return {
            category: subResult.category,
            path: [categoryName, ...subResult.path]
          };
        }
      }
    }
    
    return null;
  }

  matchesSearchCriteria(categoryName, categoryData, searchType, searchValue) {
    const lowerCategoryName = categoryName.toLowerCase();
    
    switch (searchType) {
      case 'subject':
        return lowerCategoryName.includes(searchValue) || 
               (categoryData.id && categoryData.id.includes(searchValue));
      case 'topic':
        return lowerCategoryName.includes(searchValue) ||
               this.searchInTopics(categoryData, searchValue);
      case 'tag':
        return lowerCategoryName.includes(searchValue) ||
               this.searchInTags(categoryData, searchValue);
      default:
        return false;
    }
  }

  searchInTopics(categoryData, searchValue) {
    if (categoryData.topics) {
      for (const [topicName, topicData] of Object.entries(categoryData.topics)) {
        if (topicName.toLowerCase().includes(searchValue)) {
          return true;
        }
        if (topicData.subtopics) {
          for (const subtopic of topicData.subtopics) {
            if (subtopic.toLowerCase().includes(searchValue)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  searchInTags(categoryData, searchValue) {
    // Implementation for tag-based search
    return false; // Simplified for now
  }

  findTopicHierarchy(topic) {
    // Find the hierarchical path for a topic
    const hierarchy = [];
    // Implementation would traverse the category tree to find topic hierarchy
    return hierarchy;
  }

  getMethodologiesForContentType(contentType) {
    const methodologies = {
      'video': ['visual_learning', 'multimedia', 'demonstration'],
      'audio': ['auditory_learning', 'lecture', 'discussion'],
      'text': ['reading', 'textual_analysis', 'written_instruction'],
      'interactive': ['hands_on_learning', 'simulation', 'experiential'],
      'pdf': ['document_based', 'reference_material', 'structured_content']
    };
    
    return methodologies[contentType] || [];
  }

  getDifficultyIndex(difficultyLevel) {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    return levels.indexOf(difficultyLevel);
  }

  getAudienceTagsForDifficulty(difficultyLevel) {
    const audienceTags = {
      'beginner': ['introductory', 'foundational', 'basic_concepts'],
      'intermediate': ['building_knowledge', 'practical_application', 'skill_development'],
      'advanced': ['specialized_knowledge', 'complex_concepts', 'expert_level'],
      'expert': ['cutting_edge', 'research_level', 'professional_development']
    };
    
    return audienceTags[difficultyLevel] || [];
  }

  identifyDisciplines(hierarchicalTags) {
    const disciplines = new Set();
    const disciplineKeywords = {
      'stem': ['mathematics', 'physics', 'chemistry', 'biology', 'computer_science', 'engineering'],
      'liberal_arts': ['literature', 'history', 'philosophy', 'language', 'art'],
      'business': ['management', 'finance', 'economics', 'marketing', 'operations'],
      'social_sciences': ['psychology', 'sociology', 'anthropology', 'political_science']
    };
    
    for (const tag of hierarchicalTags) {
      for (const [discipline, keywords] of Object.entries(disciplineKeywords)) {
        if (keywords.some(keyword => tag.includes(keyword))) {
          disciplines.add(discipline);
        }
      }
    }
    
    return Array.from(disciplines);
  }

  generateComplexityRelationshipTags(metadata) {
    const tags = [];
    
    // Add complexity indicators based on metadata
    if (metadata.estimated_study_time > 120) { // More than 2 hours
      tags.push('time_intensive');
    }
    
    if (metadata.learning_objectives && metadata.learning_objectives.length > 5) {
      tags.push('comprehensive_coverage');
    }
    
    if (metadata.interactive_elements && metadata.interactive_elements.length > 0) {
      tags.push('interactive_content');
    }
    
    return tags;
  }

  suggestTopicsForCategory(category) {
    // Return suggested topics based on category
    const suggestions = {
      'STEM/Computer Science': ['algorithms', 'data_structures', 'programming', 'software_engineering'],
      'STEM/Mathematics': ['calculus', 'algebra', 'statistics', 'geometry'],
      'STEM/Physics': ['mechanics', 'thermodynamics', 'electromagnetism', 'quantum_mechanics'],
      'Liberal Arts/Literature': ['fiction', 'poetry', 'literary_criticism', 'creative_writing'],
      'Business/Management': ['leadership', 'strategy', 'operations', 'human_resources']
    };
    
    return suggestions[category] || [];
  }

  async findRelatedMaterials(semanticTags) {
    // In a real implementation, this would query the database
    // For now, return empty array
    return [];
  }

  suggestPrerequisites(subject, topics) {
    const prerequisites = this.semanticConnections.conceptual_relationships.prerequisite;
    const suggestions = [];
    
    if (prerequisites[subject]) {
      suggestions.push(...prerequisites[subject]);
    }
    
    for (const topic of topics || []) {
      if (prerequisites[topic]) {
        suggestions.push(...prerequisites[topic]);
      }
    }
    
    return [...new Set(suggestions)]; // Remove duplicates
  }

  removeDuplicateCategories(categories) {
    const seen = new Set();
    return categories.filter(cat => {
      const key = cat.category + '|' + cat.path.join('/');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async extractTopicsFromText(text) {
    // Simple topic extraction - in production, use NLP
    const topicKeywords = [
      'algorithm', 'data', 'structure', 'programming', 'software',
      'mathematics', 'calculus', 'algebra', 'statistics', 'geometry',
      'physics', 'chemistry', 'biology', 'engineering',
      'literature', 'history', 'philosophy', 'art',
      'business', 'management', 'finance', 'economics'
    ];
    
    const lowerText = text.toLowerCase();
    return topicKeywords.filter(keyword => lowerText.includes(keyword));
  }
}

module.exports = CategorizationSystem;