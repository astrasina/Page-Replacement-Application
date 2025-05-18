document.addEventListener('DOMContentLoaded', () => {
            const framesInput = document.getElementById('framesInput');
            const referenceInput = document.getElementById('referenceInput');
            const framesWarning = document.getElementById('framesWarning');
            const referenceWarning = document.getElementById('referenceWarning');
            const runButton = document.getElementById('runButton');
            const fifoOutput = document.getElementById('fifoOutput');
            const lruOutput = document.getElementById('lruOutput');
            const optOutput = document.getElementById('optOutput');

            // clear button
            document.getElementById('clearButton').addEventListener('click', () => {
                framesInput.value = '';
                referenceInput.value = '';
                framesWarning.textContent = '';
                referenceWarning.textContent = '';
                fifoOutput.innerHTML = '';
                lruOutput.innerHTML = '';
                optOutput.innerHTML = '';
            });

            // button to generate a random string
            document.getElementById('randomizeButton').addEventListener('click', () => {
                const pages = Array.from({length: 20}, () => Math.floor(Math.random() * 10));
                referenceInput.value = pages.join(' ');
            });

            // run button
            runButton.addEventListener('click', () => {
                const frames = parseInt(framesInput.value, 10);
                const referenceString = referenceInput.value.trim();

                if (!frames || frames <= 0) {
                    framesWarning.textContent = 'Please enter a valid number of frames.';
                    return;
                }

                const pages = referenceString.split(/\s+/).map(Number);
                if (pages.some(isNaN)) {
                    referenceWarning.textContent = 'Reference string must contain only numbers.';
                    return;
                }

                const fifoResult = simulateFIFO(pages, frames);
                const lruResult = simulateLRU(pages, frames);
                const optResult = simulateOPT(pages, frames);

                display(fifoOutput, "FIFO", pages, fifoResult.frames, fifoResult.faults);
                display(lruOutput, "LRU", pages, lruResult.frames, lruResult.faults);
                display(optOutput, "OPT", pages, optResult.frames, optResult.faults);
            });

            // fifo algo
            function simulateFIFO(pages, frames) {
                let memory = [], queue = [], faults = 0, history = [];

                // for iteration 
                pages.forEach(p => {
                    if (!memory.includes(p)) { // answers: is the page alrdy in memory?
                        faults++; // page faults; page not in memory!
                        if (memory.length === frames) memory.splice(memory.indexOf(queue.shift()), 1);
                        memory.push(p); // space in memory = add the page
                        queue.push(p); // track the page's arrival order
                    }
                    history.push([...memory]); // new page = end of queue
                });

                return { faults, frames: normalize(history, frames) };
            }

            // lru algo
            function simulateLRU(pages, frames) {
                let memory = [], faults = 0, history = [];

                // for iteration
                pages.forEach(p => {
                    if (!memory.includes(p)) { // answers: is the page alrdy in memory?
                        faults++; // page faults = not in memory
                        if (memory.length === frames) memory.shift(); // still space in memory = add page
                    } else {
                        memory.splice(memory.indexOf(p), 1);
                    }
                    memory.push(p); // save the current state
                    history.push([...memory]);
                });

                return { faults, frames: normalize(history, frames) };
            }

            // opt aLgo
            function simulateOPT(pages, frames) {
                let memory = [], faults = 0, history = [];

                pages.forEach((p, i) => {
                    if (!memory.includes(p)) {
                        faults++;
                        if (memory.length === frames) {
                            let indices = memory.map(m => pages.slice(i + 1).indexOf(m));
                            let replaceIndex = indices.includes(-1) ? indices.indexOf(-1) : indices.indexOf(Math.max(...indices));
                            memory.splice(replaceIndex, 1);
                        }
                        memory.push(p);
                    }
                    history.push([...memory]);
                });

                return { faults, frames: normalize(history, frames) };
            }

        function normalize(history, frames) {
            return history.map(h => {
                const padded = [...h];
                while (padded.length < frames) padded.unshift('');
                return padded;
            });
        }

        // displaying results
        function display(container, title, pages, frameHistory, faults) {
            container.innerHTML = `<h3> Page Faults: ${faults} </h3>`;
            const table = document.createElement('table');

            const head = document.createElement('tr');
            pages.forEach(p => {
                const th = document.createElement('th');
                th.textContent = p;
                head.appendChild(th);
            });
            table.appendChild(head);

            for (let r = 0; r < frameHistory[0].length; r++) {
                const row = document.createElement('tr');
                for (let c = 0; c < frameHistory.length; c++) {
                    const cell = document.createElement('td');
                    cell.textContent = frameHistory[c][r];
                    row.appendChild(cell);
                }
                table.appendChild(row);
            }
            container.appendChild(table);
        }
    });
