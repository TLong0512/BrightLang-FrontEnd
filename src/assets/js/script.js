async function getQuestionsByRangeId(rangeId, number) {
    console.log('=== API REQUEST DEBUG ===');
    console.log('Calling API with rangeId:', rangeId, 'number:', number);
    
    try {
        // Step 1: Lấy list questionId từ question bank
        const questionIdsUrl = `http://localhost:5000/api/Question/generate/range/${rangeId}/${number}`;
        console.log('Step 1 - Question IDs URL:', questionIdsUrl);
        
        const idsResponse = await fetch(questionIdsUrl, {
            method: 'GET',
            credentials: 'include'
        });

        console.log('Step 1 - Response status:', idsResponse.status);
        console.log('Step 1 - Response ok:', idsResponse.ok);

        if (!idsResponse.ok) {
            throw new Error(`HTTP error! status: ${idsResponse.status}`);
        }

        const questionIds = await idsResponse.json();
        console.log('Step 1 - Question IDs received:', questionIds);

        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            console.log('No question IDs returned');
            return [];
        }

        // Step 2: Lấy chi tiết questions từ list IDs
        const detailUrl = `http://localhost:5000/api/Question/get-by-list/detail`;
        console.log('Step 2 - Detail URL:', detailUrl);
        console.log('Step 2 - Posting question IDs:', questionIds);

        const detailResponse = await fetch(detailUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(questionIds)
        });

        console.log('Step 2 - Response status:', detailResponse.status);
        console.log('Step 2 - Response ok:', detailResponse.ok);

        if (!detailResponse.ok) {
            throw new Error(`HTTP error! status: ${detailResponse.status}`);
        }

        const questions = await detailResponse.json();
        console.log('Step 2 - Questions detail received:', questions);
        
        if (questions.length > 0) {
            console.log('First question structure:');
            console.log(questions[0]);
            console.log('First question keys:', Object.keys(questions[0]));
        }
        console.log('=======================');
        
        return questions;
        
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
}
function convertApiDataToMockFormat(apiQuestions) {
    console.log('=== API to Mock Conversion ===');
    console.log('API Raw Data:', apiQuestions);
    
    if (!Array.isArray(apiQuestions) || apiQuestions.length === 0) {
        console.log('Invalid or empty API data');
        return [];
    }

    const converted = apiQuestions.map((apiQ, index) => {
        console.log(`=== PROCESSING QUESTION ${index + 1} ===`);
        console.log('Raw question object:', apiQ);
        
        // FIX: Correct path to question content
        const questionText = apiQ.questionInformation?.content || `Question ${index + 1}`;

        // FIX: Correct property name - answerDetails not answerContents
        console.log('answerDetails structure:', apiQ.answerDetails);
        
        let answers = [];
        let correctAnswerIndex = 0;
        
        if (Array.isArray(apiQ.answerDetails)) {
            console.log('First answer structure:', apiQ.answerDetails[0]);
            console.log('First answer keys:', Object.keys(apiQ.answerDetails[0] || {}));
            
            // Map answers from answerDetails
            answers = apiQ.answerDetails.map(answer => 
                answer.value || answer.content || answer.text || answer.toString()
            );
            
            // Find correct index
            const correctIndex = apiQ.answerDetails.findIndex(answer => 
                answer.isCorrect === true || answer.correct === true
            );
            correctAnswerIndex = correctIndex >= 0 ? correctIndex : 0;
        }

        const result = {
            question: questionText,
            answers: answers,
            correct: correctAnswerIndex
        };

        console.log('  Question text found:', questionText);
        console.log('  Answers found:', answers);
        console.log('  Correct index:', correctAnswerIndex);
        console.log('  Final result:', result);
        console.log('===========================');

        return result;
    });

    console.log('Final converted data:', converted);
    return converted;
}

// ==================== 1. ADD THESE NEW SECTIONS TO YOUR FILE ====================

// ADD: API Configuration (add this at the top, after your mock APIs)
const API_CONFIG = {
    baseUrl: 'http://localhost:5000/api', // Replace with your actual API base URL
    userRoadmapsEndpoint: '/UserRoadmaps',
    roadmapsEndpoint: '/Roadmaps',
    questionBankEndpoint: '/QuestionBank'
};


function makeApiRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const ajaxOptions = {
            url: url,
            method: options.method || 'GET',
            dataType: 'text', // 👈 đổi về text để tránh parse lỗi
            xhrFields: {
                withCredentials: true  
            },
            success: function(data) {
                try {
                    // Nếu có dữ liệu thì parse JSON, nếu rỗng thì trả null
                    const result = data ? JSON.parse(data) : null;
                    resolve(result);
                } catch (e) {
                    // Nếu không phải JSON thì trả nguyên văn
                    resolve(data);
                }
            },
            error: function(xhr, status, error) {
                console.error(`API request failed: ${status} - ${error}`);
                reject(new Error(`HTTP error! status: ${xhr.status}`));
            }
        };

        if (options.data) {
            ajaxOptions.data = JSON.stringify(options.data);
            ajaxOptions.contentType = 'application/json'; // 👈 thêm để backend hiểu JSON
        }

        $.ajax(ajaxOptions);
    });
}


// ==================== 2. REPLACE THESE EXISTING FUNCTIONS ====================

// REPLACE: Your existing getUserRoadMap function
function getUserRoadMap() {
    return new Promise((resolve, reject) => {
        const url = `${API_CONFIG.baseUrl}${API_CONFIG.userRoadmapsEndpoint}?page=1&pageSize=1`;
        
        makeApiRequest(url)
            .then(response => {
                console.log('=== IDs DEBUG ===');
        console.log('Response items count:', response?.items?.length);
        
        if (response?.items && response.items.length > 0) {
            response.items.forEach((item, index) => {
                console.log(`Item ${index}:`);
                console.log('  - UserRoadmap ID:', item.id);
                console.log('  - Roadmap ID:', item.roadmap?.id);
                console.log('  - Roadmap Name:', item.roadmap?.name);
            });
            
            const selectedItem = response.items[0];
            console.log('SELECTED ITEM:');
            console.log('  - Selected UserRoadmap ID:', selectedItem.id);
            console.log('  - Selected Roadmap ID:', selectedItem.roadmap?.id);
        }
        console.log('================');
                if (!response.items || response.items.length === 0) {
                    // Fallback to mock data if no roadmaps found
                    console.log('No roadmaps found, using mock data');
                    return getMockUserRoadmap();
                }
                
                const userRoadmapId = response.items[0].id;
                const detailUrl = `${API_CONFIG.baseUrl}${API_CONFIG.userRoadmapsEndpoint}/${userRoadmapId}`;
                return makeApiRequest(detailUrl);
            })
            .then(resolve)
            .catch(error => {
                console.error('API failed, using mock data:', error);
                resolve(getMockUserRoadmap());
            });
    });
}

// ADD: Mock fallback function
function getMockUserRoadmap() {
    return {
        "id": "user-roadmap-123",
        "roadmap": {
            "id": "roadmap-456",
            "name": "Lộ trình học tập cơ bản"
        },
        "processs": [
            {
                "roadmapElementId": "element-day-1",
                "isFinished": false,
                "isOpened": true
            },
            {
                "roadmapElementId": "element-day-2",
                "isFinished": false,
                "isOpened": false
            },
            {
                "roadmapElementId": "element-day-3",
                "isFinished": false,
                "isOpened": false
            },
            {
                "roadmapElementId": "element-day-4",
                "isFinished": false,
                "isOpened": false
            },
            {
                "roadmapElementId": "element-day-5",
                "isFinished": false,
                "isOpened": false
            }
        ]
    };
}

// REPLACE: Your existing getRoadMapElementDetail function
function getRoadMapElementDetail(roadmapElementId) {
    return new Promise((resolve, reject) => {
        console.log('=== Getting Questions for Element ===');
        console.log('Element ID:', roadmapElementId);
        
        const elementData = gameData.processElements.find(el => el.roadmapElementId === roadmapElementId);
        console.log('Element data found:', elementData);
        
        if (!elementData) {
            console.log('No element data found, using mock');
            resolve(getMockQuestions(roadmapElementId));
            return;
        }

        if (elementData.rangeId && elementData.questionPerDay) {
            console.log('Found rangeId:', elementData.rangeId);
            console.log('Questions per day:', elementData.questionPerDay);
            
            // FIX: Use questionPerDay from elementData instead of hardcoded value
            getQuestionsByRangeId(elementData.rangeId, elementData.questionPerDay)
                .then(apiQuestions => {
                    console.log('API returned:', apiQuestions);
                    
                    if (!apiQuestions || apiQuestions.length === 0) {
                        console.log('API returned empty, fallback to mock');
                        resolve(getMockQuestions(roadmapElementId));
                        return;
                    }

                    const convertedQuestions = convertApiDataToMockFormat(apiQuestions);
                    
                    if (convertedQuestions.length === 0) {
                        console.log('Conversion failed, fallback to mock');
                        resolve(getMockQuestions(roadmapElementId));
                        return;
                    }

                    console.log('Final questions to display:', convertedQuestions);
                    resolve(convertedQuestions);
                })
                .catch(error => {
                    console.error('API failed:', error);
                    console.log('Fallback to mock due to error');
                    resolve(getMockQuestions(roadmapElementId));
                });
        } else {
            console.log('No rangeId or questionPerDay found, using mock directly');
            console.log('Available element properties:', Object.keys(elementData));
            resolve(getMockQuestions(roadmapElementId));
        }
    });
}
// KEEP: Your existing mock questions but rename it
function getMockQuestions(roadmapElementId) {
    const mockQuestions = {
        "element-day-1": [
            {
                question: "Hành tinh nào gần Mặt Trời nhất?",
                answers: ["Sao Kim", "Sao Thủy", "Trái Đất", "Sao Hỏa"],
                correct: 1
            },
            {
                question: "Thủ đô của Việt Nam là gì?",
                answers: ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Huế"],
                correct: 1
            }
        ],
        "element-day-2": [
            {
                question: "2 + 2 × 3 bằng bao nhiêu?",
                answers: ["12", "8", "10", "6"],
                correct: 1
            },
            {
                question: "Động vật nào là 'Vua của rừng'?",
                answers: ["Hổ", "Sư tử", "Báo", "Voi"],
                correct: 1
            },
            {
                question: "Biển nào là biển lớn nhất thế giới?",
                answers: ["Biển Đông", "Biển Thái Bình Dương", "Biển Đại Tây Dương", "Biển Ấn Độ Dương"],
                correct: 1
            }
        ],
        "element-day-3": [
            {
                question: "Màu nào được tạo thành từ đỏ và vàng?",
                answers: ["Tím", "Xanh lá", "Cam", "Hồng"],
                correct: 2
            }
        ],
        "element-day-4": [
            {
                question: "Cơ quan nào trong cơ thể con người bơm máu?",
                answers: ["Phổi", "Tim", "Gan", "Thận"],
                correct: 1
            },
            {
                question: "H2O là công thức hóa học của chất gì?",
                answers: ["Không khí", "Nước", "Muối", "Đường"],
                correct: 1
            },
            {
                question: "Loài động vật nào không biết bay?",
                answers: ["Chim cánh cụt", "Đại bàng", "Chim sẻ", "Chim bồ câu"],
                correct: 0
            },
            {
                question: "Có bao nhiêu lục địa trên Trái Đất?",
                answers: ["5", "6", "7", "8"],
                correct: 2
            }
        ],
        "element-day-5": [
            {
                question: "Lục địa nào có diện tích lớn nhất?",
                answers: ["Châu Phi", "Châu Á", "Châu Âu", "Châu Mỹ"],
                correct: 1
            },
            {
                question: "Tác giả của 'Truyện Kiều' là ai?",
                answers: ["Nguyễn Du", "Nam Cao", "Tố Hữu", "Xuân Diệu"],
                correct: 0
            },
            {
                question: "Ngôn ngữ nào được sử dụng nhiều nhất thế giới?",
                answers: ["Tiếng Anh", "Tiếng Trung", "Tiếng Tây Ban Nha", "Tiếng Hindi"],
                correct: 1
            }
        ]
    };

    return mockQuestions[roadmapElementId] || [];
}

// REPLACE: Your existing updateElementProgress function
function updateElementProgress(roadmapElementId) {
    return new Promise((resolve, reject) => {
        const gameState = getCurrentGameState();
        if (!gameState.userRoadmapId) {
            reject(new Error('No user roadmap ID available'));
            return;
        }

        const elementIndex = gameState.processElements.findIndex(
            el => el.roadmapElementId === roadmapElementId
        );
        
        if (elementIndex === -1) {
            reject(new Error('Element not found in process'));
            return;
        }
        
        const dayOrder = elementIndex + 1;
        
        // Toggle finish
        const finishUrl = `${API_CONFIG.baseUrl}${API_CONFIG.userRoadmapsEndpoint}/${gameState.userRoadmapId}/${dayOrder}/toggle-finish`;
        
        makeApiRequest(finishUrl, { method: 'PUT' })
            .then(() => {
                // Open next day if exists
                if (elementIndex + 1 < gameState.processElements.length) {
                    const nextDayOrder = elementIndex + 2;
                    const openUrl = `${API_CONFIG.baseUrl}${API_CONFIG.userRoadmapsEndpoint}/${gameState.userRoadmapId}/${nextDayOrder}/toggle-open`;
                    return makeApiRequest(openUrl, { method: 'PUT' });
                }
                return Promise.resolve();
            })
            .then(() => {
                // ✅ In ra trạng thái từng ngày sau khi update
                console.group("Roadmap status after update");
                gameState.processElements.forEach((el, idx) => {
                    console.log(
                        `Day ${idx + 1}: isOpened=${el.isOpened}, isFinished=${el.isFinished}`
                    );
                });
                console.groupEnd();

                resolve({ success: true });
            })
            .catch(error => {
                console.error('API failed, continuing with mock behavior:', error);

                // ✅ Vẫn in trạng thái để dễ theo dõi
                console.group("Roadmap status (mock fallback)");
                gameState.processElements.forEach((el, idx) => {
                    console.log(
                        `Day ${idx + 1}: isOpened=${el.isOpened}, isFinished=${el.isFinished}`
                    );
                });
                console.groupEnd();

                resolve({ success: true });
            });
    });
}


// ==================== 3. ADD THESE UTILITY FUNCTIONS ====================

// ADD: Get current game state
function getCurrentGameState() {
    return gameData;
}

// ADD: Update game state with UI refresh
function updateGameState(updates) {
    Object.assign(gameData, updates);
    updateAllDayMarkers();
    updateProgressBar();
    updateHeaderText();
}

// ADD: Initialize game data from API response
function initializeGameData(roadmapData) {
    const { currentDay, completedDays, openedDays } = calculateCurrentDay(roadmapData.processs);

    updateGameState({
        userRoadmapId: roadmapData.id,
        roadmapInfo: roadmapData.roadmap,
        processElements: roadmapData.processs,
        totalDays: roadmapData.processs.length,
        completedDays,
        openedDays,
        currentDay
    });
}

function calculateCurrentDay(processElements) {
    const completedDays = [];
    const openedDays = [];
    
    processElements.forEach((element, index) => {
        const dayNumber = index + 1;
        if (element.isFinished) {
            completedDays.push(dayNumber);
        }
        if (element.isOpened) {
            openedDays.push(dayNumber);
        }
    });

    console.log('=== calculateCurrentDay DEBUG ===');
    console.log('completedDays:', completedDays);
    console.log('openedDays:', openedDays);
    
    let currentDay = 1;
    
    if (openedDays.length > 0) {
        if (completedDays.length > 0) {
            // Tìm ngày mở nhưng chưa hoàn thành
            const uncompletedOpenDays = openedDays.filter(day => !completedDays.includes(day));
            if (uncompletedOpenDays.length > 0) {
                currentDay = Math.min(...uncompletedOpenDays);
            } else {
                // Tất cả ngày mở đều đã hoàn thành, lấy ngày mở cuối cùng
                currentDay = Math.max(...openedDays);
            }
        } else {
            // Chưa hoàn thành ngày nào, lấy ngày mở đầu tiên
            currentDay = Math.min(...openedDays);
        }
    }
    
    console.log('Calculated currentDay:', currentDay);
    console.log('============================');
    
    return { currentDay, completedDays, openedDays };
}

// ==================== 4. MODIFY EXISTING FUNCTIONS ====================

// MODIFY: Your existing initializeGame function - add this check at the beginning
async function initializeGame() {
    try {
        console.log('=== DEBUG: initializeGame started ===');
        console.log('Initializing game with API...');
        
        const roadmapData = await getUserRoadMap();
        console.log('Roadmap data received:', roadmapData);
        
        initializeGameData(roadmapData);
        console.log('Game data after initialization:', gameData);
        
        // Initialize UI first
        createDayMarkers();
        updateProgressBar();
        updateHeaderText();
        
        // ✅ Đợi DOM render xong rồi mới di chuyển mascot và scroll
        setTimeout(() => {
            console.log('Moving mascot to day:', gameData.currentDay);
            moveMascotToDay(gameData.currentDay);
            scrollToCurrentDay();
        }, 300); // Tăng delay lên 300ms
        
        console.log('=== DEBUG: initializeGame completed ===');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        initializeFallbackData();
    }
}

// MODIFY: Your existing handleDayClick function - replace the try-catch block
async function handleDayClick(day) {
    console.log('=== DEBUG: handleDayClick called ===');
    console.log('Day clicked:', day);
    console.log('Game data:', gameData);
    console.log('Opened days:', gameData.openedDays);
    console.log('Process elements:', gameData.processElements);
    
    const isOpened = gameData.openedDays.includes(day);
    console.log('Is day opened?', isOpened);
    
    if (!isOpened) {
        console.log('Day is locked, returning');
        return; // Ngày bị khóa
    }

    currentQuestionIndex = 0;
    currentDayInModal = day;
    
    // Lấy element ID từ processElements
    const elementData = gameData.processElements[day - 1];
    console.log('Element data for day', day, ':', elementData);
    
    if (!elementData) {
        console.error('No element data found for day:', day);
        return;
    }
    
    currentElementId = elementData.roadmapElementId;
    console.log('Current element ID:', currentElementId);
    
    try {
        console.log('Calling getRoadMapElementDetail...');
        // Gọi API để lấy câu hỏi cho element này
        currentQuestionsData = await getRoadMapElementDetail(currentElementId);
        console.log('Questions data received:', currentQuestionsData);
        
        if (currentQuestionsData.length === 0) {
            console.log('No questions found');
            alert('Không có câu hỏi cho ngày này!');
            return;
        }
        
        console.log('Showing question...');
        showQuestion(day, 0);
        
    } catch (error) {
        console.error('Failed to load questions:', error);
        alert('Lỗi khi tải câu hỏi!');
    }
}

// MODIFY: Your existing handleAnswer function - replace the updateElementProgress section
async function handleAnswer(selectedIndex, correctIndex, day, questionIndex) {
    const buttons = $('.answer-btn');
    buttons.off('click').addClass('disabled');

    buttons.each(function (index) {
        if (index === correctIndex) {
            $(this).addClass('correct');
        } else if (index === selectedIndex && selectedIndex !== correctIndex) {
            $(this).addClass('incorrect');
        } else {
            $(this).css('opacity', '0.5');
        }
    });

    if (selectedIndex === correctIndex) {
        const isLastQuestion = questionIndex >= currentQuestionsData.length - 1;
        
        if (isLastQuestion) {
            $('#nextQuestionBtn').text('Hoàn thành ngày').show();
            
            // REPLACE THIS SECTION: Update progress via API
            try {
                await updateElementProgress(currentElementId);
                
                // Update local data
                const elementIndex = gameData.processElements.findIndex(el => el.roadmapElementId === currentElementId);
                if (elementIndex !== -1) {
                    gameData.processElements[elementIndex].isFinished = true;
                    
                    // Open next element if exists
                    if (elementIndex + 1 < gameData.processElements.length) {
                        gameData.processElements[elementIndex + 1].isOpened = true;
                        gameData.openedDays.push(elementIndex + 2);
                        gameData.currentDay = elementIndex + 2;
                    }
                }
                
                // Update completed days
                if (!gameData.completedDays.includes(day)) {
                    gameData.completedDays.push(day);
                }
                
            } catch (error) {
                console.error('Failed to update progress:', error);
                // Still update UI even if API fails
                if (!gameData.completedDays.includes(day)) {
                    gameData.completedDays.push(day);
                }
            }
        } else {
            $('#nextQuestionBtn').text('Câu tiếp theo').show();
        }

        // KEEP THE REST OF YOUR EXISTING CODE
        setTimeout(function () {
            updateAllDayMarkers();
            updateProgressBar();
            updateHeaderText();

            if (gameData.completedDays.length === gameData.totalDays) {
                showVictoryMessage();
                return;
            }
            
            if (gameData.currentDay <= gameData.totalDays) {
                moveMascotToDay(gameData.currentDay, true);
            }
        }, 1000);

    } else {
        // KEEP YOUR EXISTING RETRY LOGIC
        setTimeout(function () {
            buttons.removeClass('correct incorrect disabled').css('opacity', '1');
            buttons.each(function (index) {
                $(this).click(function () {
                    handleAnswer(index, correctIndex, day, questionIndex);
                });
            });
        }, 1500);
    }
}


// ==================== GAME DATA & LOGIC ====================

const gameData = {
    userRoadmapId: null, // roadmap người dùng đang theo học, get by id => đấy ra roadmap hiện tại
    roadmapInfo: null, // thông tin roadmap
    currentDay: 1, // ngày mà người dùng đang được mở, tính bằng số ngày lớn nhất mà isOpened = true
    totalDays: 0, // tổng số roadmapElement
    completedDays: [], // các ngày có isFinished = true
    openedDays: [], // Các ngày có isOpened = true
    processElements: [], // Lưu dữ liệu từ API, danh sách các element trong roadmap
    questions: {} // Sẽ được load động, danh sách question theo elementId
};

// Biến theo dõi trạng thái
let currentQuestionIndex = 0;
let currentDayInModal = 1;
let currentElementId = null;
let currentQuestionsData = [];

function initializeFallbackData() {
    // Dữ liệu dự phòng nếu API fail
    gameData.totalDays = 5;
    gameData.completedDays = [1];
    gameData.openedDays = [1, 2];
    gameData.currentDay = 2;
    
    createDayMarkers();
    updateProgressBar();
    scrollToCurrentDay();
    updateHeaderText();
    moveMascotToDay(gameData.currentDay);
}

// ==================== UI FUNCTIONS ====================

function updateHeaderText() {
    const roadmapName = gameData.roadmapInfo ? gameData.roadmapInfo.name : "Bài tập theo lộ trình";
    $('#headerTitle').text(roadmapName);
    $('#headerSubtitle').text(`Bạn đang ở ngày ${gameData.currentDay} trong lộ trình`);
}

function createDayMarkers() {
    const path = $('#journeyPath');
    path.find('.day-marker').remove(); // Clear existing markers

    for (let day = 1; day <= gameData.totalDays; day++) {
        const marker = $(`
            <div class="day-marker" data-day="${day}">
                <div>Ngày ${day}</div>
            </div>
        `);

        updateDayMarkerStatus(marker, day);
        marker.click(function () {
            handleDayClick(day);
        });
        path.append(marker);
    }
}

function updateDayMarkerStatus(marker, day) {
    const isCompleted = gameData.completedDays.includes(day);
    const isOpened = gameData.openedDays.includes(day);
    
    marker.removeClass('unlocked completed locked');

    if (isCompleted) {
        marker.addClass('completed');
    } else if (isOpened) {
        marker.addClass('unlocked');
    } else {
        marker.addClass('locked');
    }
}

function updateAllDayMarkers() {
    $('.day-marker').each(function () {
        const day = parseInt($(this).data('day'));
        updateDayMarkerStatus($(this), day);
    });
}


function showQuestion(day, questionIndex) {
    if (!currentQuestionsData || currentQuestionsData.length === 0) {
        console.error('No questions data available');
        return;
    }

    const questionData = currentQuestionsData[questionIndex];
    if (!questionData) {
        console.error('Question not found at index:', questionIndex);
        return;
    }

    $('#modalTitle').text(`Ngày ${day}`);
    $('#questionText').text(questionData.question);
    $('#nextQuestionBtn').hide();

    const answersContainer = $('#answersContainer');
    answersContainer.empty();

    questionData.answers.forEach(function (answer, index) {
        const button = $(`<button class="answer-btn" data-index="${index}">${answer}</button>`);
        button.click(function () {
            handleAnswer(index, questionData.correct, day, questionIndex);
        });
        answersContainer.append(button);
    });

    $('#questionModal').css('display', 'flex');
}

function nextQuestion() {
    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex < currentQuestionsData.length) {
        currentQuestionIndex = nextQuestionIndex;
        showQuestion(currentDayInModal, nextQuestionIndex);
    } else {
        $('#questionModal').hide();
        scrollToCurrentDay();
    }
}

function scrollToCurrentDay() {
    setTimeout(function () {
        const container = $('#journeyContainer');
        const marker = $(`.day-marker[data-day="${gameData.currentDay}"]`);

        if (marker.length) {
            const markerPosition = marker.position().left;
            const containerWidth = container.width();
            const scrollLeft = markerPosition - (containerWidth / 2) + (marker.width() / 2);

            container.animate({ scrollLeft: Math.max(0, scrollLeft) }, 800);
        }
    }, 100);
}

function updateProgressBar() {
    // Tính tổng số câu hỏi đã hoàn thành vs tổng số element
    const completedElements = gameData.completedDays.length;
    const totalElements = gameData.totalDays;
    const progress = totalElements > 0 ? (completedElements / totalElements) * 100 : 0;
    
    $('#progressBar').css('width', `${progress}%`);

    // Hiển thị nút finish khi hoàn thành tất cả
    if (gameData.completedDays.length === gameData.totalDays) {
        $('#finishButton').fadeIn();
    } else {
        $('#finishButton').hide();
    }
}

function showVictoryMessage() {
    $('#modalTitle').text('🎊 Chúc Mừng! 🎊');
    $('#questionText').text('Bạn đã vượt qua toàn bộ lộ trình! Bạn thật tuyệt vời!');
    $('#answersContainer').html(`
        <div style="font-size: 4em; margin: 20px 0; grid-column: 1 / -1;">🏆</div>
        <div style="color: #13547a; font-size: 1.5em; margin: 15px 0; grid-column: 1 / -1;">
            Bạn là một nhà thám hiểm xuất sắc!
        </div>
        <div style="font-size: 1.2em; margin-top: 20px; grid-column: 1 / -1; color: #717275;">
            🌟 Tổng cộng: ${gameData.totalDays} ngày hoàn thành<br>
            🎯 Hoàn thành lộ trình: ${gameData.roadmapInfo ? gameData.roadmapInfo.name : 'Lộ trình học tập'}
        </div>
    `);
    $('#nextQuestionBtn').hide();
    $('#questionModal').css('display', 'flex');
}

function moveMascotToDay(day, animate = false) {
    const marker = $(`.day-marker[data-day="${day}"]`);
    const logo = $('#mascotLogo');

    if (marker.length) {
        const markerOffset = marker.position();
        const markerWidth = marker.outerWidth();

        const top = markerOffset.top - 90;
        const left = markerOffset.left + (markerWidth / 2) - (logo.width() / 2);

        if (animate) {
            logo.animate({ top: top, left: left }, 1000);
        } else {
            logo.css({ top: top, left: left });
        }
    }
}

// ==================== EVENT HANDLERS ====================

$('#closeModal').click(function () {
    $('#questionModal').hide();
});

$('#nextQuestionBtn').click(nextQuestion);

$(document).click(function (e) {
    if (e.target.id === 'questionModal') {
        $('#questionModal').hide();
    }
});

$(document).ready(function () {
    console.log('okkk');
    initializeGame(); // Khởi tạo async
    $('#finishButton').hide();

    $('#finishButton').click(function () {
        $('#testModal').css('display', 'flex');
    });

    $('#testCloseModal, #declineTestBtn').click(async function () {
        $('#testModal').hide();

        // Call API xoá roadmap
        if (gameData.userRoadmapId) {
            try {
                const url = `${API_CONFIG.baseUrl}${API_CONFIG.userRoadmapsEndpoint}/${gameData.userRoadmapId}`;
                console.log("Deleting roadmap with ID:", gameData.userRoadmapId);
                
                await makeApiRequest(url, { method: 'DELETE' });
                console.log("Roadmap deleted successfully");

                alert("Đã xoá lộ trình!");
                // Bạn có thể redirect về trang chủ
                window.location.href = '/home-user';
            } catch (err) {
                console.error("Failed to delete roadmap:", err);
                alert("Xoá lộ trình thất bại!");
            }
        }
    });

    $('#acceptTestBtn').click(async function () {
        // Trước khi đi đến bài thi => xoá lộ trình
        if (gameData.userRoadmapId) {
            try {
                const url = `${API_CONFIG.baseUrl}${API_CONFIG.userRoadmapsEndpoint}/${gameData.userRoadmapId}`;
                console.log("Deleting roadmap with ID:", gameData.userRoadmapId);
                
                await makeApiRequest(url, { method: 'DELETE' });
                console.log("Roadmap deleted successfully");

                // Sau khi xoá thì chuyển sang bài test
                alert("Đi đến bài thi tổng hợp!");
                window.location.href = '/home-user/level-test';
            } catch (err) {
                console.error("Failed to delete roadmap:", err);
                alert("Xoá lộ trình thất bại, không thể vào thi!");
            }
        }
    });
});
