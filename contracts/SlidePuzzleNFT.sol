// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SlidePuzzleNFT is ERC721, Ownable {
    using Strings for uint256;

    // ============ Enums ============
    enum Difficulty {
        Easy,    // 3x3
        Normal,  // 4x4
        Hard,    // 5x5
        VeryHard,// 6x6 (Phase 2)
        Hell     // 7x7 (Phase 2)
    }

    enum PuzzleType {
        Number,  // 0: 数字パズル
        Image    // 1: 画像パズル
    }

    // ============ Structs ============
    struct PuzzleRecord {
        address player;
        Difficulty difficulty;
        uint256 timeInMs;  // クリアタイム（ミリ秒）
        uint256 timestamp; // ミント時刻
        PuzzleType puzzleType; // パズルタイプ
        uint256 moveCount; // 移動回数
        string imageIpfsHash; // クリア時の画像IPFSハッシュ（Imageモード時のみ）
    }

    struct LeaderboardEntry {
        address player;
        uint256 timeInMs;
        uint256 tokenId;
    }

    // ============ State Variables ============
    uint256 private _nextTokenId;

    // tokenId => PuzzleRecord
    mapping(uint256 => PuzzleRecord) public puzzleRecords;

    // difficulty => puzzleType => LeaderboardEntry[] (トップ10を保持)
    mapping(Difficulty => mapping(PuzzleType => LeaderboardEntry[])) public leaderboards;

    // 各難易度のリーダーボードサイズ上限
    uint256 public constant MAX_LEADERBOARD_SIZE = 10;

    // ============ Events ============
    event PuzzleSolved(
        address indexed player,
        uint256 indexed tokenId,
        Difficulty difficulty,
        PuzzleType puzzleType,
        uint256 timeInMs
    );

    event LeaderboardUpdated(
        Difficulty indexed difficulty,
        PuzzleType indexed puzzleType,
        address indexed player,
        uint256 timeInMs,
        uint256 rank
    );

    // ============ Constructor ============
    constructor() ERC721("Slide Puzzle", "SLIDE") Ownable(msg.sender) {
    }

    // ============ Main Functions ============

    /// @notice パズルクリア時にNFTをミント
    /// @param difficulty 難易度
    /// @param timeInMs クリアタイム（ミリ秒）
    /// @param puzzleType パズルタイプ（Number or Image）
    /// @param moveCount 移動回数
    /// @param imageIpfsHash 画像IPFSハッシュ（Imageモード時のみ）
    function mint(
        Difficulty difficulty,
        uint256 timeInMs,
        PuzzleType puzzleType,
        uint256 moveCount,
        string calldata imageIpfsHash
    ) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        puzzleRecords[tokenId] = PuzzleRecord({
            player: msg.sender,
            difficulty: difficulty,
            timeInMs: timeInMs,
            timestamp: block.timestamp,
            puzzleType: puzzleType,
            moveCount: moveCount,
            imageIpfsHash: imageIpfsHash
        });

        emit PuzzleSolved(msg.sender, tokenId, difficulty, puzzleType, timeInMs);

        // リーダーボード更新
        _updateLeaderboard(difficulty, puzzleType, msg.sender, timeInMs, tokenId);

        return tokenId;
    }

    /// @notice リーダーボードを更新
    function _updateLeaderboard(
        Difficulty difficulty,
        PuzzleType puzzleType,
        address player,
        uint256 timeInMs,
        uint256 tokenId
    ) internal {
        LeaderboardEntry[] storage board = leaderboards[difficulty][puzzleType];

        // 挿入位置を探す（タイム昇順）
        uint256 insertIndex = board.length;
        for (uint256 i = 0; i < board.length; i++) {
            if (timeInMs < board[i].timeInMs) {
                insertIndex = i;
                break;
            }
        }

        // リーダーボードに入る資格があるかチェック
        if (insertIndex >= MAX_LEADERBOARD_SIZE) {
            return; // ランク外
        }

        // 新しいエントリを作成
        LeaderboardEntry memory newEntry = LeaderboardEntry({
            player: player,
            timeInMs: timeInMs,
            tokenId: tokenId
        });

        // 配列を拡張（上限まで）
        if (board.length < MAX_LEADERBOARD_SIZE) {
            board.push(newEntry); // 一時的に末尾に追加
        }

        // 挿入位置より後ろを1つずつ後ろにシフト
        for (uint256 i = board.length - 1; i > insertIndex; i--) {
            board[i] = board[i - 1];
        }

        // 挿入
        board[insertIndex] = newEntry;

        emit LeaderboardUpdated(difficulty, puzzleType, player, timeInMs, insertIndex + 1);
    }

    // ============ View Functions ============

    /// @notice 指定難易度・パズルタイプのリーダーボードを取得
    function getLeaderboard(Difficulty difficulty, PuzzleType puzzleType)
        external
        view
        returns (LeaderboardEntry[] memory)
    {
        return leaderboards[difficulty][puzzleType];
    }

    /// @notice NFTのメタデータを取得（オンチェーンSVG）
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        PuzzleRecord memory record = puzzleRecords[tokenId];

        string memory difficultyName = _getDifficultyName(record.difficulty);
        string memory gridSize = _getGridSize(record.difficulty);
        string memory timeStr = _formatTime(record.timeInMs);
        string memory svg = _generateSVG(record.difficulty, record.timeInMs, record.puzzleType, record.imageIpfsHash, difficultyName, gridSize, record.moveCount);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Slide Puzzle #', tokenId.toString(),
                        '", "description": "Proof of solving a ', gridSize, ' slide puzzle in ', timeStr,
                        '", "attributes": [',
                        '{"trait_type": "Difficulty", "value": "', difficultyName, '"},',
                        '{"trait_type": "Grid Size", "value": "', gridSize, '"},',
                        '{"trait_type": "Type", "value": "', record.puzzleType == PuzzleType.Number ? "Number" : "Image", '"},',
                        '{"trait_type": "Time (ms)", "value": ', record.timeInMs.toString(), '},',
                        '{"trait_type": "Time", "value": "', timeStr, '"},',
                        '{"trait_type": "Moves", "value": ', record.moveCount.toString(), '}',
                        '], "image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /// @notice 難易度名を取得
    function _getDifficultyName(Difficulty difficulty) internal pure returns (string memory) {
        if (difficulty == Difficulty.Easy) return "Easy";
        if (difficulty == Difficulty.Normal) return "Normal";
        if (difficulty == Difficulty.Hard) return "Hard";
        if (difficulty == Difficulty.VeryHard) return "Very Hard";
        if (difficulty == Difficulty.Hell) return "Hell";
        return "Unknown";
    }

    /// @notice グリッドサイズを取得
    function _getGridSize(Difficulty difficulty) internal pure returns (string memory) {
        if (difficulty == Difficulty.Easy) return "3x3";
        if (difficulty == Difficulty.Normal) return "4x4";
        if (difficulty == Difficulty.Hard) return "5x5";
        if (difficulty == Difficulty.VeryHard) return "6x6";
        if (difficulty == Difficulty.Hell) return "7x7";
        return "?x?";
    }

    /// @notice タイムをフォーマット（例: 1:23.456）
    function _formatTime(uint256 timeInMs) internal pure returns (string memory) {
        uint256 mins = timeInMs / 60000;
        uint256 secs = (timeInMs % 60000) / 1000;
        uint256 ms = timeInMs % 1000;

        return string(
            abi.encodePacked(
                mins.toString(),
                ":",
                secs < 10 ? "0" : "",
                secs.toString(),
                ".",
                ms < 100 ? (ms < 10 ? "00" : "0") : "",
                ms.toString()
            )
        );
    }

    /// @notice オンチェーンSVGを生成
    function _generateSVG(
        Difficulty difficulty,
        uint256 timeInMs,
        PuzzleType puzzleType,
        string memory imageIpfsHash,
        string memory difficultyName,
        string memory gridSize,
        uint256 moveCount
    ) internal pure returns (string memory) {
        // Imageモードの場合、IPFS画像を表示
        if (puzzleType == PuzzleType.Image && bytes(imageIpfsHash).length > 0) {
            string memory bgColor = _getBackgroundColor(difficulty);
            string memory timeStr = _formatTime(timeInMs);

            return string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
                    '<defs>',
                    '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                    '<stop offset="0%" style="stop-color:', bgColor, ';stop-opacity:1" />',
                    '<stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />',
                    '</linearGradient>',
                    '</defs>',
                    '<rect width="400" height="400" fill="url(#bg)"/>',
                    '<image href="ipfs://', imageIpfsHash, '" x="85" y="50" width="230" height="230" preserveAspectRatio="xMidYMid slice"/>',
                    '<text x="200" y="310" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" font-weight="bold">',
                    difficultyName, ' - Image',
                    '</text>',
                    '<text x="200" y="350" font-family="Arial, sans-serif" font-size="28" fill="#fef9c3" text-anchor="middle" font-weight="bold">',
                    timeStr,
                    '</text>',
                    '<text x="200" y="380" font-family="Arial, sans-serif" font-size="18" fill="#a0a0a0" text-anchor="middle">',
                    'Moves: ', moveCount.toString(),
                    '</text>',
                    '</svg>'
                )
            );
        }

        // Numberモードの場合、数字グリッドを表示
        string memory bgColor = _getBackgroundColor(difficulty);
        string memory timeStr = _formatTime(timeInMs);

        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
                '<defs>',
                '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:', bgColor, ';stop-opacity:1" />',
                '<stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />',
                '</linearGradient>',
                '</defs>',
                '<rect width="400" height="400" fill="url(#bg)"/>',
                _generatePuzzleGrid(difficulty),
                '<text x="200" y="310" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle" font-weight="bold">',
                difficultyName, ' - Number',
                '</text>',
                '<text x="200" y="350" font-family="Arial, sans-serif" font-size="28" fill="#fef9c3" text-anchor="middle" font-weight="bold">',
                timeStr,
                '</text>',
                '<text x="200" y="380" font-family="Arial, sans-serif" font-size="18" fill="#a0a0a0" text-anchor="middle">',
                'Moves: ', moveCount.toString(),
                '</text>',
                '</svg>'
            )
        );
    }

    /// @notice 難易度に応じた背景色
    function _getBackgroundColor(Difficulty difficulty) internal pure returns (string memory) {
        if (difficulty == Difficulty.Easy) return "#2d5a27";      // 緑
        if (difficulty == Difficulty.Normal) return "#1e3a5f";    // 青
        if (difficulty == Difficulty.Hard) return "#7f1d1d";      // 赤
        if (difficulty == Difficulty.VeryHard) return "#8b0000";  // 濃い赤
        if (difficulty == Difficulty.Hell) return "#1a1a1a";      // 黒
        return "#333333";
    }

    /// @notice パズルグリッドのSVGを生成
    function _generatePuzzleGrid(Difficulty difficulty) internal pure returns (string memory) {
        uint256 gridCount;
        if (difficulty == Difficulty.Easy) gridCount = 3;
        else if (difficulty == Difficulty.Normal) gridCount = 4;
        else if (difficulty == Difficulty.Hard) gridCount = 5;
        else if (difficulty == Difficulty.VeryHard) gridCount = 6;
        else if (difficulty == Difficulty.Hell) gridCount = 7;
        else gridCount = 3;

        // グリッド全体のサイズを固定（Hard 5×5基準: 230px）
        uint256 gridSize = 230;
        uint256 cellSize = gridSize / gridCount;
        uint256 gap = 4;
        // グリッド全体を中央配置
        uint256 startX = (400 - gridSize) / 2;
        uint256 startY = 50;

        bytes memory cells;
        uint256 num = 1;
        uint256 totalCells = gridCount * gridCount;

        for (uint256 row = 0; row < gridCount; row++) {
            for (uint256 col = 0; col < gridCount; col++) {
                uint256 x = startX + col * cellSize + gap;
                uint256 y = startY + row * cellSize + gap;
                uint256 size = cellSize - gap * 2;

                if (num < totalCells) {
                    cells = abi.encodePacked(
                        cells,
                        '<rect x="', x.toString(), '" y="', y.toString(),
                        '" width="', size.toString(), '" height="', size.toString(),
                        '" fill="#ffffff" rx="4"/>',
                        '<text x="', (x + size / 2).toString(), '" y="', (y + size / 2 + 5).toString(),
                        '" font-family="Arial" font-size="', (cellSize / 3).toString(),
                        '" fill="#333" text-anchor="middle">', num.toString(), '</text>'
                    );
                }
                num++;
            }
        }

        return string(cells);
    }

    // ============ Admin Functions ============

    /// @notice 総発行数を取得
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
