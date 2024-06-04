const express = require('express');
const router = express.Router();

// Create Helia node
async function createNode() {
    const { createHelia } = await import('helia');
    const { unixfs } = await import('@helia/unixfs');
    const { MemoryBlockstore } = await import('blockstore-core')
    // const blockstore = new MemoryBlockstore()
    // const helia = await createHelia({ blockstore });
    const helia = await createHelia();
    const peerID = helia.libp2p.peerId.toString()
    console.log('Peer id used:', peerID)
    const fs = unixfs(helia);
    return fs;
}

// Handle POST request to the '/upload' endpoint
router.post('/upload', async (req, res) => {
    try {
        // Create a new IPFS node using the 'createNode' function
        const fs = await createNode();

        // Create a TextEncoder to encode file content
        const encoder = new TextEncoder();

        // Retrieve the list of files from the request body
        let fileList = req.body.data;

        // Check if fileList is not an array and convert it into an array
        fileList.length > 0 ? '' : fileList = [fileList];

        // Initialize a JSON string to store file information
        var jsonStr = "[";

        // Iterate through each file in the fileList array
        for (const file of fileList) {

            // Convert the files to buffer add the file to IPFS and get the CID
            let cid = await fs.addBytes(Buffer.from(JSON.stringify(file)));

            // Append file information (name, CID, mimetype) to the JSON string
            jsonStr += "{\"name\":\"" + file.name + "\",\"value\":\"" + cid.toString() + "\",\"mimetype\":\"" + file.mimetype + "\"},";
        }

        // Remove the trailing comma and close the JSON array
        jsonStr = jsonStr.replace(/,\s*$/, "") + "]";

        // Send a success response with the JSON string containing file information
        res.status(200).send(JSON.stringify({ result: 'Success', value: jsonStr }));
    } catch (error) {
        console.log(error);
        res.status(500).send(JSON.stringify({ result: 'Error', error: error.message }));
    }
});

// Handle GET request to the '/fetch' endpoint
router.get('/fetch', async (req, res) => {
    try {
        // Create a new IPFS node using the 'createNode' function
        const fs = await createNode();

        // Retrieve the CID (Content Identifier) from the query parameters
        const cid = req.query.cid;
        console.log('CID:', cid);

        // Create a TextDecoder to decode binary chunks into text
        const decoder = new TextDecoder();

        // Iterate through each chunk of data retrieved from IPFS for the given CID
        // Note:It will check using thousands of peer IDs, so may take more time to get the files
        let chunks = []
        for await (const buf of fs.cat(cid, {
            onProgress: (evt) => {
                console.info("cat event", evt.type, evt.detail);
            }
        })) {
            chunks.push(buf);
        }
        var buffer = Buffer.concat(chunks);
        res.status(200).send(buffer);

    } catch (error) {
        console.log(error);
        res.status(500).send(JSON.stringify({ result: 'Error', error: error.message }));
    }
});

module.exports = router;
