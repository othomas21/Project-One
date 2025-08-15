# RefTools MCP Integration Instructions for Claude

## Overview
RefTools is a Model Context Protocol (MCP) server that provides Claude with real-time access to technical documentation, APIs, and library references. This file contains strategic instructions for optimal usage that maximizes code robustness while minimizing unnecessary tool calls.

## Core Purpose
RefTools enhances Claude's ability to write accurate, up-to-date code by providing direct access to:
- Official API documentation
- Framework and library references
- Service documentation
- Database documentation
- Technical specifications

## Available Tools

### 1. `ref_search_documentation`
**Primary documentation search tool**
- Use for: Technical platforms, frameworks, APIs, services, databases, libraries
- Returns: Specific sections of documentation pages
- Efficiency: Most token-efficient method for technical lookups

### 2. `ref_read_url`
**Full webpage content reader**
- Use for: Following documentation links, reading complete pages
- Returns: Full content of specified URL
- Note: Use after search results to dive deeper

### 3. `ref_search_web` (Optional)
**Fallback web search**
- Use for: Cases where documentation search returns no results
- Can be disabled if alternative search provider preferred
- Environment variable: `DISABLE_SEARCH_WEB=true`

## Strategic Usage Guidelines

### When TO Use RefTools

#### Critical Scenarios (Always Check):
1. **API Integration Code**
   - Endpoint structures
   - Authentication methods
   - Request/response formats
   - Rate limits and quotas

2. **Framework-Specific Implementations**
   - React 18+ features (Suspense, Server Components, etc.)
   - Next.js 14+ App Router patterns
   - Vue 3 Composition API
   - Angular latest versions
   - Any framework released/updated after 2023

3. **Library Version Specifics**
   - Breaking changes between major versions
   - Deprecated methods or patterns
   - New recommended approaches
   - Migration guides

4. **Cloud Service Configurations**
   - AWS, Azure, GCP service specifics
   - Service quotas and limitations
   - IAM/security configurations
   - Recent service updates

5. **Database Operations**
   - NoSQL query syntax (MongoDB, DynamoDB, etc.)
   - PostgreSQL 14+ features
   - Redis 7+ commands
   - Vector database operations

6. **Security Implementations**
   - OAuth 2.0/OIDC flows
   - JWT best practices
   - CORS configurations
   - CSP headers
   - Latest security recommendations

#### Situational Usage:
1. **Complex Integrations**
   - When combining multiple services/APIs
   - Webhook implementations
   - Event-driven architectures
   - Microservice communication patterns

2. **Performance-Critical Code**
   - Database query optimization
   - Caching strategies
   - Lazy loading implementations
   - Bundle optimization techniques

3. **Error Handling Patterns**
   - Service-specific error codes
   - Retry strategies
   - Circuit breaker implementations
   - Graceful degradation approaches

### When NOT to Use RefTools

#### Well-Established Patterns:
1. **Basic Language Features**
   - Standard library functions (unless version-specific)
   - Common algorithms
   - Basic data structures
   - Language fundamentals

2. **Stable Design Patterns**
   - MVC, MVP, MVVM
   - Singleton, Factory, Observer
   - SOLID principles
   - Basic architectural patterns

3. **Generic Best Practices**
   - Code organization
   - Naming conventions
   - General testing strategies
   - Basic git workflows

4. **Mathematical Operations**
   - Standard algorithms
   - Common formulas
   - Basic statistical methods

## Intelligent Triggering Strategy

### Context Analysis Before Triggering

1. **Version Detection**
   ```
   IF user specifies version number OR mentions "latest" OR uses time indicators ("current", "new", "modern")
   THEN consider RefTools lookup
   ```

2. **Uncertainty Threshold**
   ```
   IF confidence < 80% about specific implementation details
   AND topic involves external service/API/library
   THEN use RefTools
   ```

3. **Change Frequency Assessment**
   ```
   IF technology has frequent updates (monthly/quarterly)
   AND implementation details matter
   THEN verify with RefTools
   ```

### Efficient Query Patterns

#### Pattern 1: Targeted Search
```
Instead of: "React hooks"
Use: "React 18 useEffect cleanup function"
```

#### Pattern 2: Version-Specific
```
Instead of: "MongoDB query"
Use: "MongoDB 6.0 aggregation pipeline $lookup"
```

#### Pattern 3: Feature-Specific
```
Instead of: "Next.js routing"
Use: "Next.js 14 app router parallel routes"
```

## Response Integration Best Practices

### 1. Verification Without Interruption
- Silently verify critical details
- Only mention documentation check if it changes the approach
- Integrate findings naturally into response

### 2. Confidence Signaling
```markdown
# High Confidence (no check needed):
"Here's how to implement a basic for loop..."

# Medium Confidence (quick check):
"Let me verify the exact syntax for this MongoDB operation..."

# Low Confidence (thorough check):
"I'll check the latest documentation for this AWS service configuration..."
```

### 3. Documentation Citation
When referencing checked documentation:
- Include specific version numbers found
- Note any recent changes or deprecations
- Provide documentation links when helpful

## Common Trigger Scenarios

### Automatic Triggers (High Priority):
1. User mentions specific version: "using React 18.2"
2. Error troubleshooting: "getting CORS error with fetch"
3. Migration questions: "upgrading from Vue 2 to Vue 3"
4. Integration issues: "Stripe webhook not working"
5. Performance problems: "MongoDB query too slow"

### Conditional Triggers (Context-Dependent):
1. Complex configurations: Assess if standard or service-specific
2. Authentication flows: Check if using standard OAuth or custom
3. Deployment setups: Verify platform-specific requirements
4. Testing strategies: Confirm framework-specific approaches

### Non-Triggers (Skip RefTools):
1. Algorithm explanations
2. Conceptual questions
3. Code style discussions
4. Project structure advice
5. General debugging strategies

## Performance Optimization

### Batch Lookups
When multiple related queries needed:
```
1. Group related searches
2. Use broad initial search
3. Follow up with ref_read_url for details
```

### Caching Strategy
Remember within conversation:
- Version numbers confirmed
- API endpoints verified
- Configuration patterns validated
- Deprecation warnings noted

### Token Efficiency
1. Start with `ref_search_documentation` (most efficient)
2. Use `ref_read_url` only for deep dives
3. Reserve `ref_search_web` as last resort

## Error Handling

### When RefTools Returns Nothing:
1. Broaden search terms
2. Try alternative terminology
3. Fall back to web search
4. Acknowledge uncertainty to user

### When Documentation Conflicts:
1. Prefer official sources
2. Check version compatibility
3. Note discrepancies to user
4. Suggest testing approach

## Integration with Code Generation

### Pre-Generation Checks:
```
For code involving:
- External APIs → Check endpoints, auth, payloads
- New framework features → Verify syntax, imports
- Database operations → Confirm query syntax
- Cloud services → Validate configurations
```

### Post-Generation Validation:
```
After generating code:
- Flag any assumptions made
- Note version dependencies
- Highlight areas needing testing
- Suggest documentation references
```

## Maintenance Notes

### Regular Pattern Updates:
- Monitor for new framework releases
- Track API deprecations
- Update trigger patterns based on common issues
- Refine search query effectiveness

### Feedback Loop:
- Note when RefTools was helpful
- Identify missed trigger opportunities
- Optimize query formulations
- Improve response integration

## Example Workflow

```markdown
User: "I need to implement infinite scrolling with React Query v5"

Claude's Internal Process:
1. Recognize: React Query v5 (specific version, likely has changes)
2. Trigger: ref_search_documentation "React Query v5 infinite scroll"
3. Verify: Latest patterns, breaking changes from v4
4. Generate: Code with correct v5 syntax
5. Include: Version-specific imports and setup
6. Note: Any v5-specific considerations
```

## Configuration Recommendations

```json
{
  "reftools_config": {
    "aggressive_mode": false,
    "confidence_threshold": 0.8,
    "version_checking": true,
    "silent_verification": true,
    "citation_mode": "on_significant_findings",
    "batch_related_queries": true,
    "cache_session_lookups": true
  }
}
```

## Summary

RefTools should enhance code robustness through strategic verification rather than constant checking. The key is intelligent triggering based on:
- Version specificity
- API/service integration
- Confidence levels
- Change frequency
- Error prevention

This balanced approach ensures accurate, up-to-date code generation while maintaining conversation flow and efficiency.