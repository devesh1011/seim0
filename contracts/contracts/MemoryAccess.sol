// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @title MemoryAccess
 * @dev Module for capability lists (EOA, agent keys), policy flags (public/private/paid), and revocation.
 */
contract MemoryAccess {
    enum Role { NONE, OWNER, AGENT, INDEXER, PUBLIC }
    
    struct Authorization {
        Role role;
        bool revoked;
        uint256 grantedAt;
        uint256 revokedAt;
    }
    
    // streamId => address => capability => Authorization
    mapping(string => mapping(address => mapping(string => Authorization))) public authorizations;
    
    // streamId => policy settings
    mapping(string => mapping(string => bool)) public policies;
    
    event Authorized(
        string indexed streamId,
        address indexed addr,
        string capability,
        Role role,
        uint256 timestamp
    );
    
    event Revoked(
        string indexed streamId,
        address indexed addr,
        string capability,
        uint256 timestamp
    );
    
    event PolicySet(
        string indexed streamId,
        string policy,
        bool value,
        uint256 timestamp
    );

    /**
     * @dev Grant authorization to an address for a specific capability
     */
    function authorize(
        string memory streamId,
        address addr,
        string memory capability,
        Role role
    ) external {
        require(addr != address(0), "Invalid address");
        require(role != Role.NONE, "Invalid role");
        
        // Only owner or existing authorized users can grant permissions
        require(
            isAuthorized(streamId, msg.sender, "ADMIN") ||
            isAuthorized(streamId, msg.sender, "OWNER"),
            "Not authorized to grant permissions"
        );
        
        authorizations[streamId][addr][capability] = Authorization({
            role: role,
            revoked: false,
            grantedAt: block.timestamp,
            revokedAt: 0
        });
        
        emit Authorized(streamId, addr, capability, role, block.timestamp);
    }

    /**
     * @dev Revoke authorization from an address for a specific capability
     */
    function revoke(
        string memory streamId,
        address addr,
        string memory capability
    ) external {
        require(
            isAuthorized(streamId, msg.sender, "ADMIN") ||
            isAuthorized(streamId, msg.sender, "OWNER"),
            "Not authorized to revoke permissions"
        );
        
        Authorization storage auth = authorizations[streamId][addr][capability];
        require(auth.role != Role.NONE && !auth.revoked, "Authorization not found or already revoked");
        
        auth.revoked = true;
        auth.revokedAt = block.timestamp;
        
        emit Revoked(streamId, addr, capability, block.timestamp);
    }

    /**
     * @dev Check if an address is authorized for a specific capability
     */
    function isAuthorized(
        string memory streamId,
        address addr,
        string memory capability
    ) public view returns (bool) {
        Authorization memory auth = authorizations[streamId][addr][capability];
        
        if (auth.revoked || auth.role == Role.NONE) {
            return false;
        }
        
        // Check policy for public access
        if (policies[streamId]["public"] && auth.role == Role.PUBLIC) {
            return true;
        }
        
        return auth.role != Role.NONE;
    }

    /**
     * @dev Set policy for a stream
     */
    function setPolicy(
        string memory streamId,
        string memory policy,
        bool value
    ) external {
        require(
            isAuthorized(streamId, msg.sender, "ADMIN") ||
            isAuthorized(streamId, msg.sender, "OWNER"),
            "Not authorized to set policy"
        );
        
        policies[streamId][policy] = value;
        
        emit PolicySet(streamId, policy, value, block.timestamp);
    }

    /**
     * @dev Get authorization details
     */
    function getAuthorization(
        string memory streamId,
        address addr,
        string memory capability
    ) external view returns (
        Role role,
        bool revoked,
        uint256 grantedAt,
        uint256 revokedAt
    ) {
        Authorization memory auth = authorizations[streamId][addr][capability];
        return (auth.role, auth.revoked, auth.grantedAt, auth.revokedAt);
    }

    /**
     * @dev Check policy value
     */
    function getPolicy(
        string memory streamId,
        string memory policy
    ) external view returns (bool) {
        return policies[streamId][policy];
    }
}
