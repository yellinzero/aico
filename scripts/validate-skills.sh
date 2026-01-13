#!/bin/bash

# Skills Quality Validation Script
# Validates all SKILL.md files for quality standards

echo "=== Skills Quality Validation ==="
echo ""

errors=0
warnings=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Find all SKILL.md files
SKILL_FILES=$(find employees -name "SKILL.md" 2>/dev/null)

if [ -z "$SKILL_FILES" ]; then
  echo "No SKILL.md files found in employees/"
  exit 1
fi

TOTAL_SKILLS=$(echo "$SKILL_FILES" | wc -l | xargs)
echo "Found $TOTAL_SKILLS skills to validate"
echo ""

# 1. Check description format (should have "Use when" or "Use this skill when")
echo "Checking description format..."
for skill in $SKILL_FILES; do
  if ! grep -q "Use.*when" "$skill"; then
    echo -e "  ${RED}❌ $skill: description missing 'Use when' format${NC}"
    ((errors++))
  fi
done

# 2. Check line counts (max 500 lines)
echo ""
echo "Checking line counts (max 500)..."
for skill in $SKILL_FILES; do
  lines=$(wc -l < "$skill" | xargs)
  if [ "$lines" -gt 500 ]; then
    echo -e "  ${RED}❌ $skill: $lines lines (exceeds 500)${NC}"
    ((errors++))
  elif [ "$lines" -gt 400 ]; then
    echo -e "  ${YELLOW}⚠️  $skill: $lines lines (approaching limit)${NC}"
    ((warnings++))
  fi
done

# 3. Check Iron Law sections in key skills
echo ""
echo "Checking Iron Law sections..."
IRON_LAW_SKILLS=(
  "employees/pm/skills/brainstorming/SKILL.md"
  "employees/pm/skills/prd-writing/SKILL.md"
  "employees/frontend/skills/implement/SKILL.md"
  "employees/backend/skills/implement/SKILL.md"
)

for skill in "${IRON_LAW_SKILLS[@]}"; do
  if [ -f "$skill" ]; then
    if ! grep -q "Iron Law" "$skill"; then
      echo -e "  ${RED}❌ $skill: missing Iron Law section${NC}"
      ((errors++))
    else
      echo -e "  ${GREEN}✅ $skill: has Iron Law${NC}"
    fi
  else
    echo -e "  ${YELLOW}⚠️  $skill: file not found${NC}"
    ((warnings++))
  fi
done

# 4. Check for valid YAML frontmatter
echo ""
echo "Checking YAML frontmatter..."
for skill in $SKILL_FILES; do
  if ! head -1 "$skill" | grep -q "^---$"; then
    echo -e "  ${RED}❌ $skill: missing YAML frontmatter${NC}"
    ((errors++))
  fi

  # Check for name field
  if ! grep -q "^name:" "$skill"; then
    echo -e "  ${RED}❌ $skill: missing 'name' field${NC}"
    ((errors++))
  fi

  # Check for description field
  if ! grep -q "^description:" "$skill"; then
    echo -e "  ${RED}❌ $skill: missing 'description' field${NC}"
    ((errors++))
  fi
done

# 5. Summary
echo ""
echo "=== Summary ==="
echo "Total skills: $TOTAL_SKILLS"

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
  echo -e "${GREEN}✅ All validations passed!${NC}"
  exit 0
elif [ $errors -eq 0 ]; then
  echo -e "${YELLOW}⚠️  $warnings warning(s), no errors${NC}"
  exit 0
else
  echo -e "${RED}❌ Found $errors error(s) and $warnings warning(s)${NC}"
  exit 1
fi
