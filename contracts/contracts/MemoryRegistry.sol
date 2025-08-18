// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./MemoryAccess.sol";

/**
 * @title MemoryRegistry
 * @dev Core contract for registering memory streams, owners, ACL, content hashes (CID/Merkle root), 
 * pointers to index snapshots, emit events for indexers.
 */
contract MemoryRegistry {
    struct MemoryStream {
        address owner;
        string policy;
        string latestCID;
        bytes32 latestMerkleRoot;
        uint256 lastUpdated;
        bytes32 indexRoot;
        address authorizedIndexer;
        bool exists;
    }

    mapping(string => MemoryStream) public streams;
    mapping(string => string[]) public streamHistory; // streamId => CID[]
    
    MemoryAccess public immutable accessControl;
    
    event StreamRegistered(
        string indexed streamId,
        address indexed owner,
        string policy,
        uint256 timestamp
    );
    
    event MemoryAppended(
        string indexed streamId,
        string cid,
        bytes32 merkleRoot,
        string metadata,
        uint256 timestamp
    );
    
    event IndexRootUpdated(
        string indexed streamId,
        bytes32 newIndexRoot,
        address indexed indexer,
        uint256 timestamp
    );
    
    event PolicyUpdated(
        string indexed streamId,
        string newPolicy,
        uint256 timestamp
    );

    modifier onlyStreamOwner(string memory streamId) {
        require(streams[streamId].exists, "Stream does not exist");
        require(streams[streamId].owner == msg.sender, "Not stream owner");
        _;
    }

    modifier onlyAuthorizedIndexer(string memory streamId) {
        require(streams[streamId].exists, "Stream does not exist");
        require(
            streams[streamId].authorizedIndexer == msg.sender || 
            streams[streamId].owner == msg.sender,
            "Not authorized indexer"
        );
        _;
    }

    constructor(address _accessControl) {
        accessControl = MemoryAccess(_accessControl);
    }

    /**
     * @dev Register a new memory stream
     */
    function registerStream(
        string memory streamId,
        address owner,
        string memory policy
    ) external {
        require(!streams[streamId].exists, "Stream already exists");
        require(owner != address(0), "Invalid owner address");
        
        streams[streamId] = MemoryStream({
            owner: owner,
            policy: policy,
            latestCID: "",
            latestMerkleRoot: bytes32(0),
            lastUpdated: block.timestamp,
            indexRoot: bytes32(0),
            authorizedIndexer: address(0),
            exists: true
        });
        
        emit StreamRegistered(streamId, owner, policy, block.timestamp);
    }

    /**
     * @dev Append new memory to a stream
     */
    function append(
        string memory streamId,
        string memory cid,
        bytes32 merkleRoot,
        string memory metadata
    ) external {
        require(streams[streamId].exists, "Stream does not exist");
        require(
            accessControl.isAuthorized(streamId, msg.sender, "WRITE") ||
            streams[streamId].owner == msg.sender,
            "Not authorized to write"
        );
        
        streams[streamId].latestCID = cid;
        streams[streamId].latestMerkleRoot = merkleRoot;
        streams[streamId].lastUpdated = block.timestamp;
        
        streamHistory[streamId].push(cid);
        
        emit MemoryAppended(streamId, cid, merkleRoot, metadata, block.timestamp);
    }

    /**
     * @dev Set index root (called by authorized indexers)
     */
    function setIndexRoot(
        string memory streamId,
        bytes32 indexRoot
    ) external onlyAuthorizedIndexer(streamId) {
        streams[streamId].indexRoot = indexRoot;
        
        emit IndexRootUpdated(streamId, indexRoot, msg.sender, block.timestamp);
    }

    /**
     * @dev Set authorized indexer for a stream
     */
    function setAuthorizedIndexer(
        string memory streamId,
        address indexer
    ) external onlyStreamOwner(streamId) {
        streams[streamId].authorizedIndexer = indexer;
    }

    /**
     * @dev Update stream policy
     */
    function setPolicy(
        string memory streamId,
        string memory policy
    ) external onlyStreamOwner(streamId) {
        streams[streamId].policy = policy;
        emit PolicyUpdated(streamId, policy, block.timestamp);
    }

    /**
     * @dev Get stream head information
     */
    function getHead(string memory streamId) external view returns (
        string memory cid,
        bytes32 merkleRoot,
        uint256 lastUpdated
    ) {
        require(streams[streamId].exists, "Stream does not exist");
        MemoryStream memory stream = streams[streamId];
        return (stream.latestCID, stream.latestMerkleRoot, stream.lastUpdated);
    }

    /**
     * @dev Get current index root for a stream
     */
    function getIndexRoot(string memory streamId) external view returns (bytes32) {
        require(streams[streamId].exists, "Stream does not exist");
        return streams[streamId].indexRoot;
    }

    /**
     * @dev Get stream history (list of CIDs)
     */
    function getStreamHistory(string memory streamId) external view returns (string[] memory) {
        require(streams[streamId].exists, "Stream does not exist");
        return streamHistory[streamId];
    }

    /**
     * @dev Check if stream exists
     */
    function streamExists(string memory streamId) external view returns (bool) {
        return streams[streamId].exists;
    }
}
