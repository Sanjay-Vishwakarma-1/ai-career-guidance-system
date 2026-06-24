async function generateCareer() {
    const name = document.getElementById("name").value.trim();
    const year = document.getElementById("year").value;

    const careerSelect = document.getElementById("career");
    const career = careerSelect.tomselect ? careerSelect.tomselect.getValue() : careerSelect.value;

    const skills = document.getElementById("skills").value.trim();

    document.getElementById("name-error").textContent = "";
    document.getElementById("skills-error").textContent = "";

    document.getElementById("name").classList.remove("input-error");
    document.getElementById("skills").classList.remove("input-error");

    if (!name) {
    document.getElementById("name-error").textContent =
        "⚠ Please enter your name";
    document.getElementById("name").classList.add("input-error");
    return;
    }

    if (!skills) {
    document.getElementById("skills-error").textContent =
        "⚠ Please enter your skills";
    document.getElementById("skills").classList.add("input-error");
    return;
    }

    // Show loading state
    const btn = document.querySelector('.btn-primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;

    try {
        const response = await fetch("/recommend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                year: year,
                career: career,
                skills: skills
            })
        });

        const data = await response.json();

        if (data.error) {
            alert(data.error);
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        displayResults(data);
        btn.innerHTML = originalText;
        btn.disabled = false;

    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function displayResults(data) {
    const resultSection = document.getElementById("resultSection");
    resultSection.style.display = "block";

    // Basic info
    document.getElementById("nameResult").textContent = data.name;
    document.getElementById("yearResult").textContent = data.year;
    document.getElementById("careerResult").textContent = data.career;

    // Score
    const score = data.score;
    document.getElementById("scoreText").textContent = score + "%";
    document.getElementById("scoreSmall").textContent = score + "%";

    // Update score circle
    const angle = (score / 100) * 360;
    document.getElementById("scoreCircle").style.background =
        `conic-gradient(#3b82f6 ${angle}deg, #1e2a4a ${angle}deg)`;

    // Missing count
    document.getElementById("missingCount").textContent = data.missing_skills.length;

    // AI Suggestion
    let suggestion = "";
    if (score >= 80) {
        suggestion = "🚀 Strong match! Start building projects and apply for internships.";
    } else if (score >= 50) {
        suggestion = "📚 Good foundation. Focus on filling skill gaps listed below.";
    } else {
        suggestion = "🌱 Beginner level. Follow the roadmap from step 1.";
    }
    document.getElementById("aiSuggestion").textContent = suggestion;

    // Required skills
    const requiredBox = document.getElementById("requiredSkills");
    requiredBox.innerHTML = "";
    data.required_skills.forEach(skill => {
        const isLearned = data.learned_skills.includes(skill);
        const chip = document.createElement("span");
        chip.className = `skill-chip ${isLearned ? "learned" : "missing"}`;
        chip.textContent = `${isLearned ? "✅" : "❌"} ${capitalize(skill)}`;
        requiredBox.appendChild(chip);
    });

    // Missing skills
    const missingBox = document.getElementById("missingSkills");
    missingBox.innerHTML = "";
    if (data.missing_skills.length === 0) {
        const chip = document.createElement("span");
        chip.className = "skill-chip learned";
        chip.textContent = "🎉 No missing skills! You're ready!";
        missingBox.appendChild(chip);
    } else {
        data.missing_skills.forEach(skill => {
            const chip = document.createElement("span");
            chip.className = "skill-chip missing";
            chip.textContent = `❌ ${capitalize(skill)}`;
            missingBox.appendChild(chip);
        });
    }

    // Roadmap table
    const roadmapBody = document.getElementById("roadmapBody");
    roadmapBody.innerHTML = "";
    
    if (data.roadmap && data.roadmap.length > 0) {
        data.roadmap.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span class="step-badge">${row.Step}</span></td>
                <td><strong>${row.Topic}</strong></td>
                <td>${row.Why_Learn}</td>
                <td>${row.Free_Course}</td>
                <td>${row.Certificate === "Yes" ? "✅" : "❌"}</td>
                <td>${row.YouTube}</td>
                <td><span class="level-badge ${row.Level.toLowerCase()}">${row.Level}</span></td>
                <td>${row.Project}</td>
            `;
            roadmapBody.appendChild(tr);
        });
    } else {
        roadmapBody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;">No roadmap data available</td></tr>`;
    }

    // Scroll to results
    resultSection.scrollIntoView({ behavior: "smooth" });
}

function capitalize(text) {
    return text.split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Enter key support
document.getElementById("skills").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        generateCareer();
    }
});

// Also support Enter on name field
document.getElementById("name").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        document.getElementById("skills").focus();
    }
});

// THREE.JS BACKGROUND
(function() {
    const container = document.getElementById("three-canvas");
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0d1a);

    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particles
    const particlesGeo = new THREE.BufferGeometry();
    const count = 1500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
    }
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particlesMat = new THREE.PointsMaterial({
        color: 0x6b8cff,
        size: 0.04,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Torus shapes
    const torusMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        emissive: 0x1a4a8a,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.35
    });

    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.4, 24, 64), torusMat);
    torus.position.set(-2.5, 0.5, -1);
    scene.add(torus);

    const torus2 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.2, 20, 48), torusMat.clone());
    torus2.material.color.setHex(0xa855f7);
    torus2.material.emissive.setHex(0x4a1a8a);
    torus2.position.set(3, -0.8, -2);
    scene.add(torus2);

    // Lighting
    const ambient = new THREE.AmbientLight(0x1a2a5a, 0.5);
    scene.add(ambient);

    const light = new THREE.PointLight(0x3b82f6, 1, 20);
    light.position.set(2, 3, 4);
    scene.add(light);

    const light2 = new THREE.PointLight(0xa855f7, 0.7);
    light2.position.set(-3, -1, 3);
    scene.add(light2);

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        torus.rotation.x += 0.005;
        torus.rotation.y += 0.01;
        torus2.rotation.x += 0.007;
        torus2.rotation.y -= 0.008;
        particles.rotation.y += 0.0004;
        renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();

// GSAP Card Tilt
document.querySelectorAll(".card-glow, .glass").forEach(el => {
    el.addEventListener("mousemove", e => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(el, {
            duration: 0.4,
            rotationY: x * 6,
            rotationX: -y * 6,
            transformPerspective: 800
        });
    });

    el.addEventListener("mouseleave", () => {
        gsap.to(el, {
            duration: 0.5,
            rotationY: 0,
            rotationX: 0
        });
    });
});