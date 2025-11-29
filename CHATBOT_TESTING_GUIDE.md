# 🧪 Chatbot Testing Guide

## Quick Test Scenarios

### 1️⃣ Direct QA Mode Test
**Goal**: Verify short, factual answers with citations

1. Click chatbot icon (bottom-right)
2. Click "🎯 Direct QA" button (should be cyan/highlighted by default)
3. Type: `What artifacts are in insider-data-theft case?`
4. **Expected**: Short answer listing 2-3 artifacts with `[insider-data-theft:artifact_X]` citations
5. **Success**: Response is 3-5 sentences, includes citations, factual tone

---

### 2️⃣ Teaching Mode Test
**Goal**: Verify educational explanations with examples

1. Click "📚 Teaching" button (should turn purple)
2. Type: `Explain MFT analysis`
3. **Expected**: 
   - Definition of MFT
   - Why it matters in forensics
   - Case study example with citation
   - Practical application tips
4. **Success**: Response is 8-12 sentences, includes "Concept Overview" structure, educational tone

---

### 3️⃣ Walkthrough Mode Test
**Goal**: Verify step-by-step investigation guide

1. Click "🔍 Walkthrough" button (should turn neon green)
2. Type: `How do I investigate a ransomware attack?`
3. **Expected**:
   - **Step 1**: Action title
   - Tool name (e.g., FTK Imager, Volatility)
   - Process/Command
   - Expected result
   - Citation `[ransomware-investigation:artifact_X]`
4. **Success**: Response has numbered steps, includes tool commands, procedural tone

---

### 4️⃣ Mode Switching Test
**Goal**: Verify mode changes affect responses

1. Ask in Direct QA: `What is memory forensics?`
2. Switch to Teaching mode
3. Ask same question: `What is memory forensics?`
4. **Expected**: Second answer is longer and more educational
5. **Success**: Clear difference in response style and length

---

### 5️⃣ Long Response Scroll Test
**Goal**: Verify container handles long answers

1. Select Walkthrough mode
2. Type: `Walk me through investigating insider data theft step by step`
3. **Expected**: Long response (20+ steps) with scrollbar appearing
4. Test scroll:
   - Mouse wheel ✓
   - Trackpad two-finger swipe ✓
   - Click and drag scrollbar ✓
5. **Success**: All content visible, smooth scrolling, no layout breaks

---

### 6️⃣ API Error Test (Simulated)
**Goal**: Verify graceful error handling

**If API key is missing or invalid:**
1. Select Direct QA mode
2. Type any question
3. **Expected**:
   - ⚠️ AI service temporarily unavailable
   - Mode-specific suggestions:
     - Direct QA → Forensic tools/artifacts
     - Teaching → Concepts/methodologies
     - Walkthrough → Case walkthroughs
4. **Success**: No crash, friendly error, helpful suggestions

---

### 7️⃣ Mode Indicator Test
**Goal**: Verify mode is shown in bot response

1. Ask question in any mode
2. Wait for response to complete
3. **Expected**: End of message shows `*Mode: 🎯 DIRECT QA*` (or matching emoji)
4. **Success**: Mode indicator appears, matches selected mode

---

### 8️⃣ Typing Effect Test
**Goal**: Verify streaming animation works

1. Ask any question
2. Watch response appear
3. **Expected**: 
   - Characters appear one by one
   - Small blinking cursor during streaming
   - Smooth animation
4. **Success**: Visible typing effect, no text jumping

---

### 9️⃣ Citation Format Test
**Goal**: Verify proper citation syntax

1. Select Direct QA mode
2. Type: `Show me artifacts from ransomware-investigation`
3. **Expected**: Citations like:
   - `[ransomware-investigation:artifact_1]`
   - `[insider-data-theft:finding_2]`
   - `[case_id:artifact_id]` format
4. **Success**: Consistent citation format, clickable appearance

---

### 🔟 Container Sizing Test
**Goal**: Verify responsive container behavior

1. Open chatbot
2. Resize browser window
3. **Expected**:
   - Minimum height: 300px (never shorter)
   - Maximum height: 70% of viewport
   - Container grows/shrinks with window
4. **Success**: Responsive sizing, no overflow issues

---

## 🚨 Common Issues to Watch For

### ❌ Mode Not Working
- **Symptom**: All responses sound the same regardless of mode
- **Check**: `selectedMode` state is being passed to `buildPrompt()`
- **Fix**: Verify line ~254 uses `selectedMode` not `ragResponse.mode`

### ❌ No Scroll on Long Answers
- **Symptom**: Text gets cut off, no scrollbar
- **Check**: Container has `overflow-y: auto` and `maxHeight: 70vh`
- **Fix**: Verify styles at line ~716-725

### ❌ API Returns Generic Error
- **Symptom**: "AI service unavailable" on every request
- **Check**: Gemini API key in `.env` file
- **Fix**: Ensure `VITE_GEMINI_API_KEY` is set

### ❌ Mode Button Not Highlighting
- **Symptom**: No visual feedback when clicking modes
- **Check**: `selectedMode === 'direct_qa'` condition in className
- **Fix**: Verify lines ~675-707

### ❌ Citations Missing
- **Symptom**: Responses don't include `[case_id:artifact_id]`
- **Check**: Prompt includes citation format instructions
- **Fix**: Verify `buildPrompt()` includes citation guidelines

---

## ✅ Success Criteria

All tests should show:
- ✓ Mode buttons are clickable and highlight
- ✓ Direct QA gives 3-5 sentence answers
- ✓ Teaching gives 8-12 sentence explanations  
- ✓ Walkthrough gives numbered step-by-step guides
- ✓ Long responses are fully scrollable
- ✓ API errors show friendly messages
- ✓ Mode indicator appears at end of responses
- ✓ Citations follow `[case_id:artifact_id]` format
- ✓ Container sizing is responsive
- ✓ Typing animation is visible

---

## 🎯 Performance Benchmarks

- **Response time**: < 3 seconds for first chunk
- **Streaming delay**: ~20ms per character (smooth but not too slow)
- **Scroll performance**: 60fps smooth scrolling
- **Mode switch**: Instant (< 100ms)
- **Container resize**: No reflow jank

---

## 📝 Test Report Template

```markdown
## Chatbot Mode Test - [Date]

### Direct QA Mode
- [ ] Button highlights in cyan
- [ ] Short factual answers
- [ ] Citations present

### Teaching Mode  
- [ ] Button highlights in purple
- [ ] Educational explanations
- [ ] Examples included

### Walkthrough Mode
- [ ] Button highlights in neon
- [ ] Step-by-step format
- [ ] Tool commands listed

### UI/UX
- [ ] Container min 300px
- [ ] Scrolling works
- [ ] Typing effect visible

### Error Handling
- [ ] Graceful API errors
- [ ] Mode-specific suggestions
- [ ] No crashes

**Overall**: ✅ Pass / ⚠️ Issues / ❌ Fail
**Notes**: 
```
